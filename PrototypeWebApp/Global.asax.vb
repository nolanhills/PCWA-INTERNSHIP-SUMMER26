
' -----------------------------------------------------------------------------
' File: Global.asax.vb
' Project: PCWA Senior Scam Awareness Simulator
'
' Purpose:
' Provides the ASP.NET application-start lifecycle hook.
'
' Maintenance Notes:
' The simulator currently requires no server-side startup initialization;
' scenario catalog loading occurs in the browser.
' -----------------------------------------------------------------------------

Public Class Global_asax
    Inherits HttpApplication

    Sub Application_Start(sender As Object, e As EventArgs)
        ' Reserved for application-wide initialization if server startup work is
        ' introduced later. Do not move client-side scenario setup into this hook.
    End Sub
End Class
