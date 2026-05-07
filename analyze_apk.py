"""
Comprehensive APK Analysis Script for com.todoist.apk
Extracts: metadata, permissions, activities, services, receivers, providers,
          UI layouts, resources, themes, navigation, features, and more.
"""

import os
import sys
import json
import zipfile

# Fix Windows encoding
sys.stdout.reconfigure(encoding='utf-8')
from collections import defaultdict

from androguard.misc import AnalyzeAPK
from androguard.core.apk import APK

APK_PATH = r"d:\clone\com.todoist.apk"
OUTPUT_DIR = r"d:\clone\apk_analysis"

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("=" * 80)
print("COMPREHENSIVE APK ANALYSIS: com.todoist.apk")
print("=" * 80)

# ─── 1. BASIC APK INFO ────────────────────────────────────────────────────────
print("\n[1/10] Loading APK and extracting basic info...")
apk = APK(APK_PATH)

basic_info = {
    "package_name": apk.get_package(),
    "app_name": apk.get_app_name(),
    "version_name": apk.get_androidversion_name(),
    "version_code": apk.get_androidversion_code(),
    "min_sdk": apk.get_min_sdk_version(),
    "target_sdk": apk.get_target_sdk_version(),
    "max_sdk": apk.get_max_sdk_version(),
    "effective_target_sdk": apk.get_effective_target_sdk_version(),
}

print(f"  Package: {basic_info['package_name']}")
print(f"  App Name: {basic_info['app_name']}")
print(f"  Version: {basic_info['version_name']} (code: {basic_info['version_code']})")
print(f"  Min SDK: {basic_info['min_sdk']} | Target SDK: {basic_info['target_sdk']}")

with open(os.path.join(OUTPUT_DIR, "01_basic_info.json"), "w", encoding="utf-8") as f:
    json.dump(basic_info, f, indent=2, default=str)

# ─── 2. PERMISSIONS ───────────────────────────────────────────────────────────
print("\n[2/10] Extracting permissions...")
permissions = apk.get_permissions()
declared_perms = apk.get_declared_permissions()
declared_perms_details = apk.get_declared_permissions_details()

perm_data = {
    "requested_permissions": sorted(permissions),
    "declared_permissions": sorted(declared_perms) if declared_perms else [],
    "declared_permissions_details": {k: dict(v) for k, v in declared_perms_details.items()} if declared_perms_details else {},
    "total_requested": len(permissions),
    "total_declared": len(declared_perms) if declared_perms else 0,
}

# Categorize permissions
dangerous_perms = [p for p in permissions if any(kw in p.lower() for kw in [
    'camera', 'contacts', 'location', 'microphone', 'phone', 'sms',
    'storage', 'calendar', 'sensors', 'read_external', 'write_external',
    'record_audio', 'call_log', 'read_phone', 'access_fine', 'access_coarse'
])]
perm_data["dangerous_permissions"] = sorted(dangerous_perms)

print(f"  Total requested: {perm_data['total_requested']}")
print(f"  Dangerous permissions: {len(dangerous_perms)}")
for p in dangerous_perms:
    print(f"    [!] {p}")

with open(os.path.join(OUTPUT_DIR, "02_permissions.json"), "w", encoding="utf-8") as f:
    json.dump(perm_data, f, indent=2, default=str)

# ─── 3. ACTIVITIES (SCREENS) ─────────────────────────────────────────────────
print("\n[3/10] Extracting activities (screens)...")
activities = apk.get_activities()
main_activity = apk.get_main_activity()

activity_data = {
    "main_activity": main_activity,
    "total_activities": len(activities),
    "activities": sorted(activities),
}

# Categorize activities by their names
activity_categories = defaultdict(list)
for act in activities:
    short_name = act.split('.')[-1] if '.' in act else act
    # Categorize
    lower = short_name.lower()
    if any(kw in lower for kw in ['login', 'signin', 'auth', 'signup', 'register']):
        activity_categories['authentication'].append(act)
    elif any(kw in lower for kw in ['setting', 'preference', 'config']):
        activity_categories['settings'].append(act)
    elif any(kw in lower for kw in ['task', 'todo', 'item', 'add', 'edit', 'create', 'detail']):
        activity_categories['task_management'].append(act)
    elif any(kw in lower for kw in ['main', 'home', 'dashboard', 'launch']):
        activity_categories['main_screens'].append(act)
    elif any(kw in lower for kw in ['project', 'label', 'filter', 'section']):
        activity_categories['organization'].append(act)
    elif any(kw in lower for kw in ['widget', 'shortcut']):
        activity_categories['widgets'].append(act)
    elif any(kw in lower for kw in ['notification', 'reminder', 'alarm']):
        activity_categories['notifications'].append(act)
    elif any(kw in lower for kw in ['share', 'collab', 'invite']):
        activity_categories['sharing_collaboration'].append(act)
    elif any(kw in lower for kw in ['search']):
        activity_categories['search'].append(act)
    elif any(kw in lower for kw in ['calendar', 'date', 'schedule']):
        activity_categories['calendar_scheduling'].append(act)
    elif any(kw in lower for kw in ['billing', 'payment', 'subscription', 'premium', 'upgrade']):
        activity_categories['billing'].append(act)
    elif any(kw in lower for kw in ['onboard', 'intro', 'welcome', 'tutorial']):
        activity_categories['onboarding'].append(act)
    else:
        activity_categories['other'].append(act)

activity_data["categorized"] = dict(activity_categories)

print(f"  Main Activity: {main_activity}")
print(f"  Total Activities: {len(activities)}")
for cat, acts in sorted(activity_categories.items()):
    print(f"  [{cat}]: {len(acts)} activities")

with open(os.path.join(OUTPUT_DIR, "03_activities.json"), "w", encoding="utf-8") as f:
    json.dump(activity_data, f, indent=2, default=str)

# ─── 4. SERVICES ─────────────────────────────────────────────────────────────
print("\n[4/10] Extracting services...")
services = apk.get_services()

service_categories = defaultdict(list)
for svc in services:
    short_name = svc.split('.')[-1] if '.' in svc else svc
    lower = short_name.lower()
    if any(kw in lower for kw in ['sync', 'data']):
        service_categories['sync'].append(svc)
    elif any(kw in lower for kw in ['notification', 'push', 'fcm', 'firebase', 'messaging']):
        service_categories['notifications'].append(svc)
    elif any(kw in lower for kw in ['widget']):
        service_categories['widgets'].append(svc)
    elif any(kw in lower for kw in ['reminder', 'alarm', 'schedule']):
        service_categories['reminders'].append(svc)
    elif any(kw in lower for kw in ['location', 'geo', 'fence']):
        service_categories['location'].append(svc)
    elif any(kw in lower for kw in ['backup', 'restore']):
        service_categories['backup'].append(svc)
    else:
        service_categories['other'].append(svc)

service_data = {
    "total_services": len(services),
    "services": sorted(services),
    "categorized": dict(service_categories),
}

print(f"  Total Services: {len(services)}")
for cat, svcs in sorted(service_categories.items()):
    print(f"  [{cat}]: {len(svcs)} services")

with open(os.path.join(OUTPUT_DIR, "04_services.json"), "w", encoding="utf-8") as f:
    json.dump(service_data, f, indent=2, default=str)

# ─── 5. RECEIVERS ────────────────────────────────────────────────────────────
print("\n[5/10] Extracting broadcast receivers...")
receivers = apk.get_receivers()

receiver_data = {
    "total_receivers": len(receivers),
    "receivers": sorted(receivers),
}

print(f"  Total Receivers: {len(receivers)}")
for r in sorted(receivers):
    print(f"    - {r}")

with open(os.path.join(OUTPUT_DIR, "05_receivers.json"), "w", encoding="utf-8") as f:
    json.dump(receiver_data, f, indent=2, default=str)

# ─── 6. CONTENT PROVIDERS ────────────────────────────────────────────────────
print("\n[6/10] Extracting content providers...")
providers = apk.get_providers()

provider_data = {
    "total_providers": len(providers),
    "providers": sorted(providers),
}

print(f"  Total Providers: {len(providers)}")
for p in sorted(providers):
    print(f"    - {p}")

with open(os.path.join(OUTPUT_DIR, "06_providers.json"), "w", encoding="utf-8") as f:
    json.dump(provider_data, f, indent=2, default=str)

# ─── 7. FEATURES & LIBRARIES ────────────────────────────────────────────────
print("\n[7/10] Extracting features, libraries, and intent filters...")
features = apk.get_features()
libraries = apk.get_libraries()

# Extract intent filters for activities
intent_filters = {}
try:
    for act in activities[:20]:  # Sample first 20
        filters = apk.get_intent_filters("activity", act)
        if filters:
            intent_filters[act] = filters
except:
    pass

features_data = {
    "features": sorted(features) if features else [],
    "libraries": sorted(libraries) if libraries else [],
    "intent_filters_sample": intent_filters,
}

print(f"  Features: {len(features) if features else 0}")
if features:
    for f_item in sorted(features):
        print(f"    - {f_item}")
print(f"  Libraries: {len(libraries) if libraries else 0}")

with open(os.path.join(OUTPUT_DIR, "07_features_libs.json"), "w", encoding="utf-8") as f:
    json.dump(features_data, f, indent=2, default=str)

# ─── 8. RESOURCE ANALYSIS ────────────────────────────────────────────────────
print("\n[8/10] Analyzing APK resources and file structure...")

file_analysis = defaultdict(lambda: {"count": 0, "total_size": 0, "files": []})

with zipfile.ZipFile(APK_PATH, 'r') as z:
    for info in z.infolist():
        ext = os.path.splitext(info.filename)[1].lower()
        category = "other"
        
        if info.filename.startswith("res/layout"):
            category = "layouts"
        elif info.filename.startswith("res/drawable") or info.filename.startswith("res/mipmap"):
            category = "drawables_images"
        elif info.filename.startswith("res/values"):
            category = "values"
        elif info.filename.startswith("res/menu"):
            category = "menus"
        elif info.filename.startswith("res/anim") or info.filename.startswith("res/animator"):
            category = "animations"
        elif info.filename.startswith("res/color"):
            category = "colors"
        elif info.filename.startswith("res/xml"):
            category = "xml_configs"
        elif info.filename.startswith("res/raw"):
            category = "raw_resources"
        elif info.filename.startswith("res/font"):
            category = "fonts"
        elif info.filename.startswith("res/navigation"):
            category = "navigation"
        elif info.filename.startswith("assets/"):
            category = "assets"
        elif info.filename.startswith("lib/"):
            category = "native_libs"
        elif ext == ".dex":
            category = "dex_files"
        elif info.filename.startswith("META-INF/"):
            category = "meta_inf"
        elif info.filename.startswith("kotlin/"):
            category = "kotlin"
        
        file_analysis[category]["count"] += 1
        file_analysis[category]["total_size"] += info.compress_size
        if len(file_analysis[category]["files"]) < 30:  # Store sample file names
            file_analysis[category]["files"].append(info.filename)

    # Extract layout file names for UI analysis
    layout_files = [info.filename for info in z.infolist() if info.filename.startswith("res/layout")]
    drawable_files = [info.filename for info in z.infolist() if info.filename.startswith("res/drawable") or info.filename.startswith("res/mipmap")]
    navigation_files = [info.filename for info in z.infolist() if info.filename.startswith("res/navigation")]
    menu_files = [info.filename for info in z.infolist() if info.filename.startswith("res/menu")]
    anim_files = [info.filename for info in z.infolist() if info.filename.startswith("res/anim")]
    font_files = [info.filename for info in z.infolist() if info.filename.startswith("res/font")]
    all_files = [info.filename for info in z.infolist()]

resource_data = {
    "file_categories": {k: {"count": v["count"], "total_size_bytes": v["total_size"], "sample_files": v["files"]} for k, v in file_analysis.items()},
    "layout_files": sorted(layout_files),
    "navigation_files": sorted(navigation_files),
    "menu_files": sorted(menu_files),
    "animation_files": sorted(anim_files),
    "font_files": sorted(font_files),
    "drawable_count": len(drawable_files),
    "total_files_in_apk": len(all_files),
}

print(f"  Total files in APK: {len(all_files)}")
for cat, data in sorted(file_analysis.items()):
    size_mb = data["total_size"] / (1024*1024)
    print(f"  [{cat}]: {data['count']} files ({size_mb:.2f} MB)")

print(f"\n  Layout files: {len(layout_files)}")
print(f"  Navigation files: {len(navigation_files)}")
print(f"  Menu files: {len(menu_files)}")
print(f"  Animation files: {len(anim_files)}")
print(f"  Font files: {len(font_files)}")

with open(os.path.join(OUTPUT_DIR, "08_resources.json"), "w", encoding="utf-8") as f:
    json.dump(resource_data, f, indent=2, default=str)

# ─── 9. UI SCREEN ANALYSIS (from layout names) ──────────────────────────────
print("\n[9/10] Analyzing UI screens from layout files...")

ui_screens = defaultdict(list)
for layout in layout_files:
    # Extract the layout name from the path
    name = os.path.splitext(os.path.basename(layout))[0]
    lower = name.lower()
    
    if any(kw in lower for kw in ['task', 'todo', 'item']):
        ui_screens['task_screens'].append(name)
    elif any(kw in lower for kw in ['project']):
        ui_screens['project_screens'].append(name)
    elif any(kw in lower for kw in ['label', 'tag']):
        ui_screens['label_screens'].append(name)
    elif any(kw in lower for kw in ['filter']):
        ui_screens['filter_screens'].append(name)
    elif any(kw in lower for kw in ['setting', 'preference', 'config']):
        ui_screens['settings_screens'].append(name)
    elif any(kw in lower for kw in ['dialog', 'popup', 'modal', 'bottom_sheet', 'bottomsheet']):
        ui_screens['dialogs_popups'].append(name)
    elif any(kw in lower for kw in ['toolbar', 'appbar', 'header', 'navigation', 'nav', 'drawer', 'sidebar', 'menu']):
        ui_screens['navigation_elements'].append(name)
    elif any(kw in lower for kw in ['list', 'recycler', 'adapter', 'row', 'cell']):
        ui_screens['list_components'].append(name)
    elif any(kw in lower for kw in ['widget']):
        ui_screens['widget_layouts'].append(name)
    elif any(kw in lower for kw in ['login', 'auth', 'signin', 'signup', 'register']):
        ui_screens['auth_screens'].append(name)
    elif any(kw in lower for kw in ['search']):
        ui_screens['search_screens'].append(name)
    elif any(kw in lower for kw in ['calendar', 'date', 'time', 'schedule', 'picker']):
        ui_screens['date_time_screens'].append(name)
    elif any(kw in lower for kw in ['comment', 'note', 'description']):
        ui_screens['comment_note_screens'].append(name)
    elif any(kw in lower for kw in ['notification', 'reminder']):
        ui_screens['notification_screens'].append(name)
    elif any(kw in lower for kw in ['share', 'collab', 'invite', 'team']):
        ui_screens['collaboration_screens'].append(name)
    elif any(kw in lower for kw in ['onboard', 'intro', 'welcome', 'tutorial']):
        ui_screens['onboarding_screens'].append(name)
    elif any(kw in lower for kw in ['premium', 'upgrade', 'billing', 'subscription']):
        ui_screens['premium_screens'].append(name)
    else:
        ui_screens['other_screens'].append(name)

ui_data = {
    "total_unique_layouts": len(layout_files),
    "screen_categories": {k: {"count": len(v), "layouts": sorted(v)} for k, v in ui_screens.items()},
}

print(f"  Total unique layouts: {len(layout_files)}")
for cat, layouts in sorted(ui_screens.items()):
    print(f"  [{cat}]: {len(layouts)} layouts")
    for l in sorted(layouts)[:5]:
        print(f"    - {l}")
    if len(layouts) > 5:
        print(f"    ... and {len(layouts)-5} more")

with open(os.path.join(OUTPUT_DIR, "09_ui_screens.json"), "w", encoding="utf-8") as f:
    json.dump(ui_data, f, indent=2, default=str)

# ─── 10. THIRD-PARTY LIBRARIES & INTEGRATIONS ───────────────────────────────
print("\n[10/10] Detecting third-party libraries and integrations...")

# Check for known library packages in the DEX
known_libs = {
    "Firebase": "com.google.firebase",
    "Google Play Services": "com.google.android.gms",
    "Google Material": "com.google.android.material",
    "Retrofit": "retrofit2",
    "OkHttp": "okhttp3",
    "Gson": "com.google.gson",
    "Glide": "com.bumptech.glide",
    "Picasso": "com.squareup.picasso",
    "Room Database": "androidx.room",
    "WorkManager": "androidx.work",
    "Navigation Component": "androidx.navigation",
    "ViewPager2": "androidx.viewpager2",
    "RecyclerView": "androidx.recyclerview",
    "ConstraintLayout": "androidx.constraintlayout",
    "CoordinatorLayout": "androidx.coordinatorlayout",
    "LiveData": "androidx.lifecycle",
    "Dagger/Hilt": "dagger.hilt",
    "Kotlin Coroutines": "kotlinx.coroutines",
    "RxJava": "io.reactivex",
    "Timber": "timber.log",
    "Sentry": "io.sentry",
    "Crashlytics": "com.google.firebase.crashlytics",
    "Facebook SDK": "com.facebook",
    "Google Auth": "com.google.android.gms.auth",
    "Apple Auth": "com.apple",
    "Compose": "androidx.compose",
    "DataStore": "androidx.datastore",
    "Paging": "androidx.paging",
    "Fragment": "androidx.fragment",
    "AppCompat": "androidx.appcompat",
    "CardView": "androidx.cardview",
    "SwipeRefresh": "androidx.swiperefreshlayout",
    "WebView": "android.webkit",
    "Biometric": "androidx.biometric",
    "Camera": "androidx.camera",
    "ExoPlayer": "com.google.android.exoplayer",
    "Lottie": "com.airbnb.lottie",
    "Moshi": "com.squareup.moshi",
    "Coil": "coil",
    "Ktor": "io.ktor",
}

detected_libs = {}
with zipfile.ZipFile(APK_PATH, 'r') as z:
    all_paths = [info.filename for info in z.infolist()]
    all_paths_str = "\n".join(all_paths)
    
    for lib_name, package in known_libs.items():
        matching = [p for p in all_paths if package.replace('.', '/') in p]
        if matching:
            detected_libs[lib_name] = {
                "package": package,
                "files_found": len(matching),
                "sample_paths": matching[:5]
            }

# Check for native libs
native_libs = [p for p in all_paths if p.startswith("lib/")]
native_archs = set()
for nl in native_libs:
    parts = nl.split("/")
    if len(parts) >= 2:
        native_archs.add(parts[1])

libs_data = {
    "detected_libraries": detected_libs,
    "total_detected": len(detected_libs),
    "native_libraries": native_libs,
    "native_architectures": sorted(native_archs),
    "uses_kotlin": any("kotlin/" in p for p in all_paths),
    "uses_jetpack_compose": "Compose" in detected_libs,
}

print(f"  Detected {len(detected_libs)} third-party libraries:")
for lib_name, info in sorted(detected_libs.items()):
    print(f"    [+] {lib_name} ({info['files_found']} files)")
print(f"\n  Native architectures: {sorted(native_archs)}")
print(f"  Uses Kotlin: {libs_data['uses_kotlin']}")
print(f"  Uses Jetpack Compose: {libs_data['uses_jetpack_compose']}")

with open(os.path.join(OUTPUT_DIR, "10_libraries.json"), "w", encoding="utf-8") as f:
    json.dump(libs_data, f, indent=2, default=str)

# ─── MANIFEST DUMP ────────────────────────────────────────────────────────────
print("\n[BONUS] Dumping AndroidManifest.xml...")
try:
    manifest_xml = apk.get_android_manifest_axml().get_xml()
    with open(os.path.join(OUTPUT_DIR, "AndroidManifest.xml"), "wb") as f:
        f.write(manifest_xml)
    print("  [OK] AndroidManifest.xml saved")
except Exception as e:
    print(f"  [FAIL] Could not extract manifest: {e}")

# ─── SUMMARY ──────────────────────────────────────────────────────────────────
print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
print(f"\nAll analysis files saved to: {OUTPUT_DIR}")
print(f"\nKey findings:")
print(f"  - App: {basic_info['app_name']} v{basic_info['version_name']}")
print(f"  - Package: {basic_info['package_name']}")
print(f"  - {len(activities)} activities (screens)")
print(f"  - {len(services)} services")
print(f"  - {len(receivers)} broadcast receivers")
print(f"  - {len(providers)} content providers")
print(f"  - {perm_data['total_requested']} permissions ({len(dangerous_perms)} dangerous)")
print(f"  - {len(layout_files)} UI layouts")
print(f"  - {len(detected_libs)} third-party libraries")
print(f"  - Uses Kotlin: {libs_data['uses_kotlin']}")
print(f"  - Uses Compose: {libs_data['uses_jetpack_compose']}")
