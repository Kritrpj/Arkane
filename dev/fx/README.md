Drop effect files you are allowed to use here (.webp animated, .webm, or .png still), then reload the harness.
Sub-folders are fine. The harness also finds any folder named "fx" or with "jb2a" in its name elsewhere in the project.
A file is used for a spell when the spell name appears in its file name OR in any folder name,
ignoring capitals, spaces, _ and -:
  FireBolt_01_Regular_Orange_30ft_1600x400.webp   ->  "Fire Bolt"
  Eldritch_Blast/anything.webm                    ->  "Eldritch Blast"
Many files for one spell (colours, 05ft/15ft/30ft/60ft/90ft): "01 Regular" first, then the smallest range that still reaches the target.
From your Foundry data copy e.g. modules/JB2A_DnD5e/Library/Cantrip/Fire_Bolt/ into dev/fx/ (the harness cannot see Foundry's modules/ folder).
Animated .webp is played frame by frame (needs Chrome/Edge); other browsers fall back to a plain <img>.
The "สกิล" dropdown also lists every file found under "ไฟล์ FX" so you can play any file directly;
the line next to the cast button (and the top of the board for 5s) says what was found, or why a file did not play.
Free JB2A: GitHub Jules-Bens-Aa/JB2A_DnD5e (or the free module from Foundry's Add-on Modules) has Library/Cantrip/Fire_Bolt and Eldritch_Blast in 05/15/30/60/90ft.
Copy just the folders you need; the *_Thumb.webp preview pictures in them are ignored.
This folder is git-ignored on purpose: free and Patreon JB2A files are licensed assets, do not commit them.
