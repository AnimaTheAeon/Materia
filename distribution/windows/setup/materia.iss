; Materia installer (per-user, no admin needed).
; Data lives in %APPDATA%\Materia; the program goes in %LOCALAPPDATA%\Programs\Materia.

#define AppName "Materia"
#define AppPublisher "AnimaTheAeon"
#define AppURL "https://github.com/AnimaTheAeon/Materia"
#define AppExeName "Prowlarr.exe"
#define AppVersion GetEnv('MATERIAVERSION')

[Setup]
AppId={{6E0C2B8A-3F57-4C7B-9C1E-8A5B2D7E4F31}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}/issues
AppUpdatesURL={#AppURL}/releases
DefaultDirName={localappdata}\Programs\Materia
DisableDirPage=yes
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputBaseFilename=Materia-Setup-{#AppVersion}
SolidCompression=yes
AllowUNCPath=False
UninstallDisplayIcon={app}\bin\{#AppExeName}
UninstallDisplayName={#AppName}
SetupIconFile=..\..\..\src\Prowlarr.ico
DisableReadyPage=True
CompressionThreads=2
Compression=lzma2/normal
VersionInfoVersion={#AppVersion}
SetupLogging=yes
OutputDir=output
WizardStyle=modern
CloseApplications=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopIcon"; Description: "{cm:CreateDesktopIcon}"
Name: "startupShortcut"; Description: "Start Materia when I sign in to Windows"; GroupDescription: "Start automatically"

[Files]
Source: "..\..\..\_artifacts\{#Runtime}\{#Framework}\Prowlarr\*"; Excludes: "Prowlarr.Update"; DestDir: "{app}\bin"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#AppName}"; Filename: "{app}\bin\{#AppExeName}"; WorkingDir: "{app}\bin"; IconFilename: "{app}\bin\{#AppExeName}"
Name: "{userdesktop}\{#AppName}"; Filename: "{app}\bin\{#AppExeName}"; WorkingDir: "{app}\bin"; Tasks: desktopIcon
Name: "{userstartup}\{#AppName}"; Filename: "{app}\bin\{#AppExeName}"; Parameters: "/nobrowser"; WorkingDir: "{app}\bin"; Tasks: startupShortcut

[InstallDelete]
Name: "{app}\bin"; Type: filesandordirs

[Run]
Filename: "{app}\bin\{#AppExeName}"; Description: "Start Materia"; Flags: postinstall skipifsilent nowait
