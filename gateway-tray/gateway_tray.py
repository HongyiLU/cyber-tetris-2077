import os
import sys
import subprocess
import threading
import time
from pathlib import Path

try:
    import pystray
    from PIL import Image, ImageDraw
    HAS_PYSTRAY = True
except ImportError:
    HAS_PYSTRAY = False
    print("pystray and Pillow not installed")
    print("Run: pip install pystray pillow")

OPENCLAW_PATH = Path(os.environ.get('APPDATA', '')) / 'npm' / 'openclaw.cmd'

def run_command(cmd):
    try:
        result = subprocess.run(
            f'"{OPENCLAW_PATH}" {cmd}',
            shell=True,
            capture_output=True,
            text=True
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, '', str(e)

def open_dashboard(icon, item):
    import webbrowser
    webbrowser.open('http://127.0.0.1:18789/')

def start_gateway(icon, item):
    run_command('daemon start')
    icon.notify('Gateway start command sent', 'OpenClaw Gateway')

def stop_gateway(icon, item):
    run_command('daemon stop')
    icon.notify('Gateway stop command sent', 'OpenClaw Gateway')

def restart_gateway(icon, item):
    run_command('daemon restart')
    icon.notify('Gateway restart command sent', 'OpenClaw Gateway')

def check_status(icon, item):
    success, stdout, stderr = run_command('daemon status')
    if success:
        icon.notify('Status checked', 'OpenClaw Gateway')
        print(stdout)
    else:
        icon.notify('Status check failed', 'OpenClaw Gateway')

def create_image():
    width = 64
    height = 64
    image = Image.new('RGB', (width, height), (45, 52, 54))
    dc = ImageDraw.Draw(image)
    
    dc.ellipse([16, 16, 48, 48], fill=(46, 204, 113))
    dc.ellipse([22, 10, 42, 30], fill=(52, 231, 128))
    dc.rectangle([28, 35, 36, 50], fill=(41, 128, 185))
    
    return image

def quit_app(icon, item):
    icon.stop()

def main():
    if not HAS_PYSTRAY:
        print("Installing dependencies...")
        os.system('pip install pystray pillow')
        print("Please run the script again.")
        return
    
    if not OPENCLAW_PATH.exists():
        print(f"Error: Cannot find openclaw.cmd at {OPENCLAW_PATH}")
        return
    
    icon = pystray.Icon(
        "openclaw-gateway",
        create_image(),
        "OpenClaw Gateway",
        menu=pystray.Menu(
            pystray.MenuItem("🎯 Open Dashboard", open_dashboard, default=True),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("▶️ Start Gateway", start_gateway),
            pystray.MenuItem("⏹️ Stop Gateway", stop_gateway),
            pystray.MenuItem("🔄 Restart Gateway", restart_gateway),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("📊 Check Status", check_status),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("❌ Quit", quit_app)
        )
    )
    
    print("OpenClaw Gateway Tray running!")
    print("Check your system tray for the icon.")
    
    icon.run()

if __name__ == "__main__":
    main()
