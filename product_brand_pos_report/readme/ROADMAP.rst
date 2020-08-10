The init of report.pos.order model is fully rewritten (no calling its super).
In future versions of pos module it could be great to split init method of report.pos.order model in different methods like "_select" and "_from" to avoid overwrite the full method.
