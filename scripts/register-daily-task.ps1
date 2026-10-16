# 毎朝 8 時に記事の下書きを生成するタスクを、Windows のタスク スケジューラに登録する
#
# 使い方（PowerShell で markdown-blog フォルダーから実行）:
#   .\scripts\register-daily-task.ps1            # 登録（すでにあれば上書き）
#   .\scripts\register-daily-task.ps1 -Remove    # 登録を解除
#
# - ログオン中だけ実行される（管理者権限は不要）
# - 8 時に PC が止まっていた場合は、次に起動したときに実行される

param([switch]$Remove)

$TaskName = 'markdown-blog 毎朝の下書き生成'

if ($Remove) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Output "解除しました: $TaskName"
    return
}

$ProjectDir = Split-Path -Parent $PSScriptRoot
$Npm = (Get-Command npm.cmd).Source

$Action = New-ScheduledTaskAction -Execute $Npm -Argument 'run draft:daily' -WorkingDirectory $ProjectDir
$Trigger = New-ScheduledTaskTrigger -Daily -At '08:00'
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Force | Out-Null
Write-Output "登録しました: $TaskName（毎日 08:00 / 作業フォルダー: $ProjectDir）"
