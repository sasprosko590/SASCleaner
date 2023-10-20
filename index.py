import os
import asyncio

async def delete_files_in_folder(folder_path):
    try:
        command = f'Get-ChildItem -Path "{folder_path}\\*" | ForEach-Object {{ Remove-Item $_.FullName -Force -Recurse -ErrorAction SilentlyContinue -Verbose }}'
        os.system(f'powershell -Command "{command}"')
    except Exception as error:
        print(f"Error deleting files in {folder_path}: {error}")

async def default_folders():
    try:
        username = os.environ.get('USERNAME')
        if username:
            return [
                "c:\\Windows\\Prefetch",
                "c:\\Windows\\Temp",
                f"c:\\Users\\{username}\\AppData\\Local\\Temp",
            ]
        else:
            print("Default folders cannot be initialized due to missing username.")
            return []
    except Exception as error:
        print("Error while getting default folders:", error)
        return []

async def delete_files_in_default_folders():
    folders = await default_folders()
    for folder in folders:
        await delete_files_in_folder(folder)

async def open_tool(tool_command, tool_display_name):
    try:
        os.system(tool_command)
        print(f"{tool_display_name} opened successfully.")
    except Exception as error:
        print(f"Error opening {tool_display_name}: {error}")

async def run_powershell_command(command, verb='RunAs'):
    powershell_command = f'powershell -Command "& {{ Start-Process cmd.exe -Verb {verb} -ArgumentList \'/c\', \'{command}\' -Wait }}"'
    await open_tool(powershell_command, command)

async def clear(options=None):
    try:
        if options is None:
            options = {}

        folders = await default_folders()

        if options.get("clearWindowsOld"):
            folders.append("c:\\windows.old")
        if options.get("clearWindows10Upgrade"):
            folders.append("c:\\Windows10Upgrade")

        if options.get("clearSpotifyData"):
            try:
                file_path = os.path.join(os.path.dirname(__file__), "SpotifyInfo.txt")
                file_content = (
                    "\u0059\u006f\u0075\u0020\u0063\u0061\u006e\u0020\u0065\u006e\u0074\u0065\u0072\u0020"
                    "\u0074\u0068\u0065\u0020\u0053\u0070\u006f\u0074\u0069\u0066\u0079\u0020\u0061\u0070\u0070\u006c"
                    "\u0069\u0063\u0061\u0074\u0069\u006f\u006e\u002c\u0020\u0067\u006f\u0020\u0074\u006f\u0020\u0074\u0068"
                    "\u0065\u0020\u0022\u0053\u0065\u0074\u0074\u0069\u006e\u0067\u0073\u0022\u0020\u0073\u0065\u0063\u0074"
                    "\u0069\u006f\u006e\u0020\u0061\u006e\u0064\u0020\u0063\u006c\u0065\u0061\u0072\u0020\u0069\u0074\u0020\u0066"
                    "\u0072\u006f\u006d\u0020\u0074\u0068\u0065\u0020\u0022\u0043\u006c\u0065\u0061\u0072\u0020\u0043\u0061\u0063"
                    "\u0068\u0065\u0022\u0020\u006f\u0070\u0074\u0069\u006f\u006e\u002c\u0020\u0079\u006f\u0075\u0020\u0063\u0061"
                    "\u006e\u0020\u0061\u006c\u0073\u006f\u0020\u0064\u0065\u006c\u0065\u0074\u0065\u0020\u0022\u0044\u006f\u0077"
                    "\u006e\u006c\u006f\u0061\u0064\u0073\u0022\u0020\u0066\u0072\u006f\u006d\u0020\u0074\u0068\u0065\u0020\u0073"
                    "\u0061\u006d\u0065\u0020\u0073\u0065\u0063\u0074\u0069\u006f\u006e\u002e"
                )

                if os.path.exists(file_path):
                    with open(file_path, "w", encoding="utf-8") as file:
                        file.write(file_content)
                    print(f"Updated file content: {file_path}")
                else:
                    with open(file_path, "w", encoding="utf-8") as file:
                        file.write(file_content)
                    print(f"File created and content written: {file_path}")

            except Exception as error:
                print("An error occurred:", str(error))

        try:
            if options.get('clearWindowsUpdate', False):
                await run_powershell_command('dism /online /cleanup-image /startcomponentcleanup', 'RunAs')
            if options.get('openCDF', False):
                await run_powershell_command('chkdsk /f', 'RunAs')
            if options.get('openCDR', False):
                await run_powershell_command('chkdsk /r', 'RunAs')
            if options.get('openCDX', False):
                await run_powershell_command('chkdsk /x', 'RunAs')
            if options.get('openDismAddPackages', False):
                await run_powershell_command('dism /online /add-package /packagepath:C:\\path\\to\\update.cab', 'RunAs')
            if options.get('openDismCheckHealth', False):
                await run_powershell_command('dism /online /cleanup-image /checkhealth', 'RunAs')
            if options.get('openDismGetPackages', False):
                await run_powershell_command('dism /online /get-packages', 'RunAs')
            if options.get('openDismRepair', False):
                await run_powershell_command('dism /online /cleanup-image /restorehealth /source:C:\\path\\to\\repairsource\\install.wim', 'RunAs')
            if options.get('openDismRestoreHealth', False):
                await run_powershell_command('dism /online /cleanup-image /restorehealth', 'RunAs')
            if options.get('openDiskCleaner', False):
                await open_tool("cleanmgr.exe", "Disk Cleaner")
            if options.get('openMDT', False):
                await open_tool("mdsched.exe", "MDT")
            if options.get('openMRT', False):
                await open_tool("mrt.exe", "MRT")
            if options.get('openSFC', False):
                await run_powershell_command('sfc /scannow', 'RunAs')
            if options.get('updateCheckWindowsUpdate', False):
                await run_powershell_command('wuauclt.exe /detectnow', 'RunAs')
        except Exception as error:
            print(f"An error occurred: {error}")

        await delete_files_in_default_folders()

    except Exception as error:
        print(f"An error occurred: {error}")

if __name__ == "__main__":
    options = {
        'clearSpotifyData': True,
        'clearWindows10Upgrade': True,
        'clearWindowsOld': True,
        'clearWindowsUpdate': True,
        'openCDF': True,
        'openCDR': True,
        'openCDX': True,
        'openDiskCleaner': True,
        'openDismAddPackages': True,
        'openDismCheckHealth': True,
        'openDismGetPackages': True,
        'openDismRepair': True,
        'openDismRestoreHealth': True,
        'openMDT': True,
        'openMRT': True,
        'openSFC': True,
        'updateCheckWindowsUpdate': True,
    }
    asyncio.run(clear(options))
