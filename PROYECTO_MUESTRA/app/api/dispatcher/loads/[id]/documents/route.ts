// app/api/dispatcher/loads/[id]/documents/route.ts
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"
import { documentTypeSchema } from "@/lib/validations/schemas"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await context.params

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify load exists
    const { data: load, error: loadError } = await supabase
      .from("loads")
      .select("id")
      .eq("id", id)
      .single()

    if (loadError || !load) {
      return NextResponse.json({ error: "Load not found" }, { status: 404 })
    }

    // Fetch documents
    const { data: documents, error: docsError } = await supabase
      .from("load_documents")
      .select("*")
      .eq("load_id", id)
      .order("uploaded_at", { ascending: false })

    if (docsError) {
      console.error("Documents fetch error:", docsError)
      return NextResponse.json(
        { error: docsError.message || "Failed to fetch documents" },
        { status: 500 }
      )
    }

    // Generate fresh signed URLs for each document that has a storage_path
    const adminSupabase = createAdminClient()
    const documentsWithUrls = await Promise.all(
      (documents || []).map(async (doc) => {
        if (doc.storage_path) {
          const { data: signedData } = await adminSupabase.storage
            .from("load-documents")
            .createSignedUrl(doc.storage_path, 3600) // 1 hour expiry

          return {
            ...doc,
            url: signedData?.signedUrl || doc.url,
          }
        }
        return doc
      })
    )

    return NextResponse.json({ documents: documentsWithUrls })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await context.params

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check permission
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || !["admin", "dispatcher"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Verify load exists
    const { data: load, error: loadError } = await supabase
      .from("loads")
      .select("id, reference_number")
      .eq("id", id)
      .single()

    if (loadError || !load) {
      return NextResponse.json({ error: "Load not found" }, { status: 404 })
    }

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const rawDocType = (formData.get("document_type") as string) || "Other"

    // Validate document_type against allowed enum
    const docTypeResult = documentTypeSchema.safeParse(rawDocType)
    if (!docTypeResult.success) {
      return NextResponse.json(
        { error: "Invalid document_type", details: docTypeResult.error.issues.map(i => ({ field: "document_type", message: i.message })) },
        { status: 400 },
      )
    }
    const documentType = docTypeResult.data

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (50MB max)
    if (file.size > 52428800) {
      return NextResponse.json({ error: "File exceeds 50MB limit" }, { status: 400 })
    }

    // Validate filename length
    if (file.name.length > 255) {
      return NextResponse.json({ error: "Filename too long (max 255 characters)" }, { status: 400 })
    }

    // Build storage path: load_id/timestamp_filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const storagePath = `${id}/${timestamp}_${sanitizedName}`

    // Upload to Supabase Storage using admin client (bypasses RLS)
    const adminSupabase = createAdminClient()
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await adminSupabase.storage
      .from("load-documents")
      .upload(storagePath, fileBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Generate a signed URL (1 hour expiry — refreshed on GET)
    const { data: signedData } = await adminSupabase.storage
      .from("load-documents")
      .createSignedUrl(storagePath, 3600)

    const url = signedData?.signedUrl || ""

    // Insert metadata row
    const { data: document, error: insertError } = await supabase
      .from("load_documents")
      .insert({
        load_id: id,
        filename: file.name,
        url,
        storage_path: storagePath,
        document_type: documentType,
        file_size: file.size,
        uploaded_by: user.id,
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      // Clean up the uploaded file if metadata insert fails
      await adminSupabase.storage.from("load-documents").remove([storagePath])
      console.error("Document insert error:", insertError)
      return NextResponse.json(
        { error: insertError.message || "Failed to save document record" },
        { status: 500 }
      )
    }

    // Log activity
    await adminSupabase.from("activity_log").insert({
      entity_type: "load_document",
      entity_id: document.id,
      action: "created",
      user_id: user.id,
      details: {
        load_id: id,
        load_reference: load.reference_number,
        filename: file.name,
        document_type: documentType,
        file_size: file.size,
        uploaded_by: user.email,
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
