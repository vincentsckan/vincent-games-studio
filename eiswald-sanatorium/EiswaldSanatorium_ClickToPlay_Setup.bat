@echo off
chcp 65001 >nul
setlocal EnableExtensions
title 《霧嶺療養院：白鴉之冬》本機 3D 遊戲一鍵安裝與啟動器 (Vincent Games Studio)
echo ===============================================================================
echo   《霧嶺療養院：白鴉之冬》(Eiswald Sanatorium: Winter of the White Crow)
echo   Vincent Games Studio - 本機 Godot 4.3 Forward+ 3D 自動安裝與啟動程序
echo ===============================================================================

set "INSTALL_DIR=%LOCALAPPDATA%\VincentGamesStudio\EiswaldSanatorium"
if exist "%~dp0project.godot" set "INSTALL_DIR=%~dp0"

if exist "%INSTALL_DIR%\project.godot" goto :have_project

echo [1/3] 正在從 Vincent Games Studio 雲端下載遊戲主程式與 3D 資產包...
mkdir "%INSTALL_DIR%" 2>nul
set "EISWALD_INSTALL_DIR=%INSTALL_DIR%"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $d=$env:EISWALD_INSTALL_DIR; if ([string]::IsNullOrWhiteSpace($d)) { Write-Host 'EISWALD_INSTALL_DIR is empty'; exit 1 }; New-Item -ItemType Directory -Force -Path $d | Out-Null; $uri='https://vincentsckan.github.io/vincent-games-studio/demos/eiswald-sanatorium/eiswald_sanatorium_full_game.tar.gz'; if (-not [string]::IsNullOrWhiteSpace($env:EISWALD_PACKAGE_URL)) { $uri=$env:EISWALD_PACKAGE_URL }; $pkg=Join-Path $d 'pkg.tar.gz'; try { Invoke-WebRequest -Uri $uri -OutFile $pkg } catch { Write-Host $_.Exception.Message; exit 1 }; if (-not (Test-Path -LiteralPath $pkg)) { Write-Host 'download missing'; exit 1 }; & tar -xzf $pkg -C $d --strip-components=1; if ($LASTEXITCODE -ne 0) { Write-Host 'extract failed'; exit 1 }; Remove-Item -LiteralPath $pkg -Force -ErrorAction SilentlyContinue; if (-not (Test-Path -LiteralPath (Join-Path $d 'project.godot'))) { Write-Host 'project.godot missing after extract'; exit 1 }; exit 0"
if errorlevel 1 goto :fail
if not exist "%INSTALL_DIR%\project.godot" goto :fail

:have_project
echo [2/3] 正在註冊網站一鍵啟動協定 (vincentgame://)...
powershell -NoProfile -ExecutionPolicy Bypass -File "%INSTALL_DIR%\tools\register_local_click_launcher.ps1"
if errorlevel 1 goto :fail

echo [3/3] 正在啟動《霧嶺療養院：白鴉之冬》本機 3D 遊戲...
powershell -NoProfile -ExecutionPolicy Bypass -File "%INSTALL_DIR%\play_game_windows.ps1"
if errorlevel 1 goto :fail
exit /b 0

:fail
echo.
echo [失敗] 下載、解壓或啟動沒有完成，已停止後續步驟。
echo 安裝目錄：%INSTALL_DIR%
pause
exit /b 1
