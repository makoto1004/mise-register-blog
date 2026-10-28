# 毎朝 7 時半に SNS 投稿用のファイルを作るタスクを、Windows のタスク スケジューラに登録する
#
# 使い方（PowerShell で markdown-blog フォルダーから実行）:
#   .\scripts\register-sns-task.ps1            # 登録（すでにあれば上書き）
#   .\scripts\register-sns-task.ps1 -Remove    # 登録を解除
#
# - ログオン中だけ実行される（管理者権限は不要）
# - 7 時半に PC が止まっていた場合は、次に起動したときに実行される

param([switch]$Remove)

$TaskName = 'markdown-blog 毎朝の SNS 投稿づくり'

if ($Remove) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Output "解除しました: $TaskName"
    return
}

$ProjectDir = Split-Path -Parent $PSScriptRoot
$Npm = (Get-Command npm.cmd).Source

$Action = New-ScheduledTaskAction -Execute $Npm -Argument 'run sns:daily' -WorkingDirectory $ProjectDir
$Trigger = New-ScheduledTaskTrigger -Daily -At '07:30'
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Force | Out-Null
Write-Output "登録しました: $TaskName（毎日 07:30 / 作業フォルダー: $ProjectDir）"
