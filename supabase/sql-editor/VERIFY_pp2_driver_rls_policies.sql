-- Ejecutar después de la migración RLS (debe devolver 6 filas + política customer en documents)

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('load_messages', 'load_documents')
ORDER BY tablename, policyname;
