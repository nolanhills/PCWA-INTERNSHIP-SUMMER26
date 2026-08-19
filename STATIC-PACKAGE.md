# Static deployment package

Create a current, self-contained static deployment package from the authoritative simulator by running this command from the repository root:

```powershell
.\tools\build-static-package.ps1
```

The command generates `StaticPackage/` and `StaticPackage.zip`. Both are disposable build artifacts and are ignored by Git. Never edit or manually maintain `StaticPackage`; rebuild it from `PrototypeWebApp` whenever the source changes.

## Update workflow

1. Modify and test `PrototypeWebApp` normally.
2. Merge or update the authoritative source through the normal workflow.
3. Run `.\tools\build-static-package.ps1`.
4. Test the generated `StaticPackage` over HTTP or HTTPS.
5. Give `StaticPackage.zip` to the administrator of the destination server.
6. Replace the previously hosted package when deploying an update.

This keeps the ASP.NET/Azure application and customer-hosted static package aligned with the same authoritative code, scenario XML, and media assets.
