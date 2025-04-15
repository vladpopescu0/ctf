import os
import shlex
import time
import logging
import subprocess

ADB = "adb"

CHALL_APPS = [
    "tech.bricked.viewer",
    "tech.bricked.haikueditor",
]

OTHER_APPS = [
    "com.android.chrome",
]

FLAGS = {
    "/storage/emulated/0/Android/data/tech.bricked.viewer/files/flag_part1.txt": "flags/flag_part1.txt",
    "/sdcard/flag_part2.jpg": "flags/flag_part2.jpg",
}

logging.basicConfig()

class Bot:
    def __init__(self, flags, adb_conn=None):
        self.logger = logging.getLogger("yaybotyay")
        self.logger.setLevel(logging.INFO)
        self.logger.info("Starting the bot...")
        self.flags = flags

        if adb_conn:
            self.adb_host, self.adb_port = adb_conn
            self.connect_adb()

    def log(self, msg):
        self.logger.info(msg)

    def exec(self, array, output=False):
        if output:
            ret = subprocess.run(array, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            logging.info(f"Output: {ret.stdout.decode()}")
            logging.info(f"Error: {ret.stderr.decode()}")
        else:
            subprocess.run(array, stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)

    def connect_adb(self):
        self.exec([ADB, "connect", f"{self.adb_host}:{self.adb_port}"], output=True)

    def ensure_flags(self):
        for remote_path, local_path in self.flags.items():
            assert os.path.exists(local_path), f"Flag file {local_path} does not exist"
            self.exec([ADB, "shell", "mkdir", "-p", os.path.dirname(remote_path)], output=True)
            self.exec([ADB, "push", local_path, remote_path], output=True)
            self.exec([ADB, "shell", "chmod", "444", shlex.quote(remote_path)])

    def force_stop(self, app):
        # force stop the app
        self.exec([ADB, "shell", "am", "force-stop", app])

    def reset_app(self, app):
        # clear the app data
        self.exec([ADB, "shell", "pm", "clear", app])

    def close_all_apps(self):
        # close all apps
        self.exec([ADB, "shell", "service", "call", "activity_task", "23"])

    def clear_clipboard(self):
        # This APK is not in the handout, but it does what it says on the tin; the clipboard is
        # cleared between attempts
        self.exec([ADB, "shell", "monkey", "-p", "tech.bricked.clipboardclearer", "1"])

    def full_cleanup(self):
        # reset all apps
        for app in CHALL_APPS:
            self.force_stop(app)
            self.reset_app(app)

        for app in OTHER_APPS:
            self.force_stop(app)
        # close all apps
        self.close_all_apps()
        # clear the clipboard
        self.clear_clipboard()

        # Return to home
        self.exec([ADB, "shell", "input", "keyevent", "KEYCODE_HOME"])

    def open_user_website(self, website):
        website = shlex.quote(website)
        self.log(f"Opening website: {website}")
        subprocess.run([ADB, "shell", "am", "start", "-n", "com.android.chrome/com.google.android.apps.chrome.Main", "-d", website])
        self.log("Waiting for the website to load...")
        time.sleep(5)
        # Tap the center of the screen
        self.log("Tapping the center of the screen...")
        subprocess.run([ADB, "shell", "input", "tap", "540", "960"])
        time.sleep(10)
        self.log("Closing the browser...")

    def visit_url(self, url):
        self.full_cleanup()
        self.ensure_flags()
        self.open_user_website(url)
        self.full_cleanup()
    
def main():
   website = input("Enter the website to open: ")
   bot = Bot(FLAGS)
   bot.visit_url(website)
   print("Done!")

if __name__ == "__main__":
    main()