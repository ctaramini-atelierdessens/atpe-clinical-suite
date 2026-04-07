const { data: job, error: jobError } = await (supabase as any)
  .from('import_jobs')
  .insert({
    organization_id: organizationId,
    uploaded_by: user.id,
    file_name: file.name,
    mime_type: file.type,
    storage_bucket: storageBucket,
    storage_path: storagePath,
    status: 'uploaded',
    row_count: rows.length,
    summary: {
      sheetNames,
      mapping,
      mode,
    },
  } as any)