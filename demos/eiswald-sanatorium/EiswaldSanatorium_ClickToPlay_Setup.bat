@echo off
chcp 65001 >nul
title 《霧嶺療養院：白鴉之冬》本機 3D 遊戲一鍵安裝與啟動器 (Vincent Games Studio)
echo ===============================================================================
echo   《霧嶺療養院：白鴉之冬》(Eiswald Sanatorium: Winter of the White Crow)
echo   Vincent Games Studio - 本機 Godot 4.3 Forward+ 3D 自動安裝與啟動程序
echo ===============================================================================

set "INSTALL_DIR=%LOCALAPPDATA%\VincentGamesStudio\EiswaldSanatorium"
if exist "%~dp0project.godot" (
    set "INSTALL_DIR=%~dp0"
)

if not exist "%INSTALL_DIR%\project.godot" (
    echo [1/3] 正在從 Vincent Games Studio 雲端下載遊戲主程式與 3D 資產包...
    mkdir "%INSTALL_DIR%" 2>nul
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://vincentsckan.github.io/vincent-games-studio/demos/eiswald-sanatorium/eiswald_sanatorium_full_game.tar.gz' -OutFile '%INSTALL_DIR%\pkg.tar.gz'; tar -xzf '%INSTALL_DIR%\pkg.tar.gz' -C '%INSTALL_DIR%' --strip-components=1; Remove-Item '%INSTALL_DIR%\pkg.tar.gz' -Force"
)

echo [2/3] 正在註冊網站一鍵啟動協定 (vincentgame://)...
powershell -NoProfile -ExecutionPolicy Bypass -File "%INSTALL_DIR%\tools\register_local_click_launcher.ps1"

echo [3/3] 正在啟動《霧嶺療養院：白鴉之冬》本機 3D 遊戲...
powershell -NoProfile -ExecutionPolicy Bypass -File "%INSTALL_DIR%\play_game_windows.ps1"
