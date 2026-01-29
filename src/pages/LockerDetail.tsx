@@
-  const { mutateAsync: sendUnlock } = useSendUnlockCommand();
+  const { mutateAsync: sendUnlock } = useSendUnlockCommand();
+  const { connections, activeConnection, setActiveConnection } = nwc as any;
@@
-  return (
+  return (
     <div className="container mx-auto p-6">
+      {connections && connections.length > 1 && (
+        <div className="mb-4 flex items-center gap-2">
+          <span className="text-sm text-muted-foreground">Wallet</span>
+          <select
+            className="px-2 py-1 border rounded"
+            value={activeConnection ?? ''}
+            onChange={(e) => setActiveConnection(e.target.value)}
+          >
+            {connections.map((c: any) => (
+              <option key={c.connectionString} value={c.connectionString}>
+                {c.alias ?? c.connectionString}
+              </option>
+            ))}
+          </select>
+        </div>
+      )}
       <div className="card">
*** End Patch
