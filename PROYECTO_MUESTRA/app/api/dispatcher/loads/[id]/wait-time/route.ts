// app/api/dispatcher/loads/[id]/wait-time/route.ts
// Log, list, and update wait time events for a load.
// Used by both drivers (logging wait) and dispatchers (reviewing/adjusting).
// Feeds into both A/R billing (customer detention charges) and A/P (driver pay).
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const VALID_EVENTS = [
  "pickup_wait",
  "delivery_wait",
  "return_wait",
  "customs_hold",
  "yard_wait",
  "other",
] as const

type Props = { params: Promise<{ id: string }> }

// ─── GET: List wait time events for this load ───
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("waiting_time_events")
      .select(
        `id, load_id, driver_id, event_name, event_date, start_time, end_time,
         duration_minutes, location, billable, rate_per_hour, charge_amount,
         free_time_minutes, driver_payable, driver_rate_per_hour, driver_pay_amount,
         notes, logged_by, created_at, updated_at,
         drivers(id, first_name, last_name)`
      )
      .eq("load_id", id)
      .order("event_date", { ascending: false })

    if (error) {
      console.error("Wait time fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch wait time events" }, { status: 500 })
    }

    // Compute summary
    const totalMinutes = data?.reduce((sum, e) => sum + (e.duration_minutes || 0), 0) || 0
    const totalBillable = data?.reduce((sum, e) => sum + (e.charge_amount || 0), 0) || 0
    const totalDriverPay = data?.reduce((sum, e) => sum + (e.driver_pay_amount || 0), 0) || 0

    return NextResponse.json({
      events: data || [],
      summary: {
        count: data?.length || 0,
        total_minutes: totalMinutes,
        total_hours: Math.round((totalMinutes / 60) * 100) / 100,
        total_billable: totalBillable,
        total_driver_pay: totalDriverPay,
      },
    })
  } catch (error) {
    console.error("Error fetching wait time:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ─── POST: Log a new wait time event ───
export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate event_name
    if (!body.event_name || !VALID_EVENTS.includes(body.event_name)) {
      return NextResponse.json(
        { error: `event_name must be one of: ${VALID_EVENTS.join(", ")}` },
        { status: 400 }
      )
    }

    // Must have either duration_minutes or start_time+end_time
    if (!body.duration_minutes && !(body.start_time && body.end_time)) {
      return NextResponse.json(
        { error: "Provide either duration_minutes or start_time + end_time" },
        { status: 400 }
      )
    }

    // Verify load exists and get driver_id
    const { data: load, error: loadErr } = await supabase
      .from("loads")
      .select("id, driver_id, reference_number")
      .eq("id", id)
      .single()

    if (loadErr || !load) {
      return NextResponse.json({ error: "Load not found" }, { status: 404 })
    }

    // Compute duration from times if provided
    let durationMinutes = Number(body.duration_minutes) || 0
    if (body.start_time && body.end_time) {
      const start = new Date(body.start_time)
      const end = new Date(body.end_time)
      durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000)
      if (durationMinutes < 0) {
        return NextResponse.json({ error: "end_time must be after start_time" }, { status: 400 })
      }
    }

    const insertData = {
      load_id: id,
      driver_id: body.driver_id || load.driver_id || null,
      event_name: body.event_name,
      event_date: body.event_date || new Date().toISOString(),
      start_time: body.start_time || null,
      end_time: body.end_time || null,
      duration_minutes: durationMinutes,
      location: body.location || null,
      billable: body.billable !== false,
      rate_per_hour: body.rate_per_hour ?? 75.0,
      free_time_minutes: body.free_time_minutes ?? 60,
      driver_payable: body.driver_payable !== false,
      driver_rate_per_hour: body.driver_rate_per_hour ?? 75.0,
      notes: body.notes || null,
      logged_by: body.logged_by || "dispatcher",
    }

    const { data: event, error: insertErr } = await supabase
      .from("waiting_time_events")
      .insert(insertData)
      .select()
      .single()

    if (insertErr) {
      console.error("Wait time insert error:", insertErr)
      return NextResponse.json({ error: insertErr.message || "Failed to log wait time" }, { status: 500 })
    }

    // Activity log
    const adminSupabase = createAdminClient()
    await adminSupabase.from("activity_log").insert({
      entity_type: "waiting_time_event",
      entity_id: event.id,
      action: "created",
      user_id: user.id,
      details: {
        load_id: id,
        reference_number: load.reference_number,
        event_name: body.event_name,
        duration_minutes: durationMinutes,
        logged_by: insertData.logged_by,
        created_by: user.email,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("Error logging wait time:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ─── PATCH: Update an existing wait time event ───
export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    if (!body.event_id) {
      return NextResponse.json({ error: "event_id is required" }, { status: 400 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (body.duration_minutes !== undefined) updateData.duration_minutes = Number(body.duration_minutes)
    if (body.start_time !== undefined) updateData.start_time = body.start_time
    if (body.end_time !== undefined) updateData.end_time = body.end_time
    if (body.location !== undefined) updateData.location = body.location
    if (body.billable !== undefined) updateData.billable = body.billable
    if (body.rate_per_hour !== undefined) updateData.rate_per_hour = Number(body.rate_per_hour)
    if (body.free_time_minutes !== undefined) updateData.free_time_minutes = Number(body.free_time_minutes)
    if (body.driver_payable !== undefined) updateData.driver_payable = body.driver_payable
    if (body.driver_rate_per_hour !== undefined) updateData.driver_rate_per_hour = Number(body.driver_rate_per_hour)
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.event_name !== undefined) {
      if (!VALID_EVENTS.includes(body.event_name)) {
        return NextResponse.json({ error: `Invalid event_name` }, { status: 400 })
      }
      updateData.event_name = body.event_name
    }

    const { data: event, error: updateErr } = await supabase
      .from("waiting_time_events")
      .update(updateData)
      .eq("id", body.event_id)
      .eq("load_id", id) // ensure event belongs to this load
      .select()
      .single()

    if (updateErr) {
      console.error("Wait time update error:", updateErr)
      return NextResponse.json({ error: updateErr.message || "Failed to update" }, { status: 500 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error updating wait time:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
