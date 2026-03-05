' OpenClaw Gateway Tray Launcher
' Hides the PowerShell console window

Set WshShell = CreateObject("WScript.Shell")
scriptPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
psScript = Chr(34) & scriptPath & "\Gateway-Tray.ps1" & Chr(34)

command = "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File " & psScript

WshShell.Run command, 0, False
