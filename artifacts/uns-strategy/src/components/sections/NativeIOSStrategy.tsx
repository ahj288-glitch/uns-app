export function NativeIOSStrategy() {
  const archLayers = [
    {
      layer: "Presentation Layer",
      tech: "SwiftUI + UIKit (selective)",
      responsibility: "All screens, components, animations, interaction handling, accessibility. SwiftUI-first with UIKit bridges for complex interactions (e.g. custom keyboard, media recording).",
      pattern: "MVVM + ViewState",
    },
    {
      layer: "ViewModel Layer",
      tech: "ObservableObject / @Observable (iOS 17+)",
      responsibility: "Business logic per-screen. State transformation, validation, error mapping. ViewModels are platform-agnostic — no UIKit/SwiftUI imports. Fully testable.",
      pattern: "Clean MVVM",
    },
    {
      layer: "Domain Layer",
      tech: "Pure Swift — no external frameworks",
      responsibility: "Use cases, entities, repository protocols. The heart of the product — defines what أُنْس does, independent of how data arrives or how UI renders it.",
      pattern: "Clean Architecture",
    },
    {
      layer: "Data Layer",
      tech: "URLSession + SwiftData / Core Data",
      responsibility: "Repository implementations. Network (AI API, analytics, sync), local persistence (journal entries, mood history, preferences), secure keychain storage.",
      pattern: "Repository Pattern",
    },
    {
      layer: "Infrastructure Layer",
      tech: "Apple System Frameworks",
      responsibility: "Notifications (UserNotifications), audio (AVFoundation/SpeechSynthesis), haptics (CoreHaptics), network monitoring (NWPathMonitor), secure storage (Keychain), analytics instrumentation.",
      pattern: "Adapter Pattern",
    },
  ];

  const modules = [
    {
      module: "Core",
      submodules: ["DesignSystem", "NetworkClient", "Analytics", "ErrorHandling", "Extensions"],
      desc: "Shared utilities with zero feature dependencies. Design tokens, HTTP layer, event tracking, error taxonomy. The stable foundation everything else imports from.",
      deps: "None",
    },
    {
      module: "Auth",
      submodules: ["OnboardingFlow", "BaselineQuestionnaire", "ConsentManager", "SessionManager"],
      desc: "Full onboarding journey: account creation, anonymous entry, emotional baseline, consent, expectation setting. Session management with keychain-backed tokens.",
      deps: "Core",
    },
    {
      module: "Companion",
      submodules: ["ChatInterface", "CompanionViewModel", "MemoryEngine", "AIProvider", "VoiceLayer"],
      desc: "The main AI conversation experience. Multi-provider routing, real-time streaming responses, emotional memory context injection, Arabic TTS/STT, crisis detection.",
      deps: "Core, Auth",
    },
    {
      module: "MoodCheck",
      submodules: ["MoodSelector", "CheckInFlow", "MoodPersistence", "CheckInHistory"],
      desc: "Daily 30-second mood check-in with Arabic emotional vocabulary. Local persistence, streak tracking, mood history for insights engine.",
      deps: "Core",
    },
    {
      module: "Journal",
      submodules: ["JournalEditor", "EntryArchive", "AIReflection", "VoiceNote", "ExportEngine"],
      desc: "Private on-device journaling with AES-256 encryption before sync. Mood-linked entries, AI reflection generation, voice recording, PDF export, semantic retrieval.",
      deps: "Core, Companion",
    },
    {
      module: "Content",
      submodules: ["GuidedPlayer", "ContentLibrary", "ProgramEngine", "OfflineCache"],
      desc: "Breathing exercises, guided reflections, thematic journeys. Offline-first with background sync. Custom audio player with custom scrubber and smooth session controls.",
      deps: "Core",
    },
    {
      module: "Insights",
      submodules: ["MoodTrends", "StreakEngine", "ProgressionSystem", "AIMonthlyReport"],
      desc: "Beautiful mood trend visualization with Charts framework. Streak tracking with HealthKit-style gamification. Monthly AI-generated emotional summary.",
      deps: "Core, MoodCheck",
    },
    {
      module: "Share",
      submodules: ["CardGenerator", "CardCustomizer", "ShareSheet", "PrivacyFilter"],
      desc: "Emotional fingerprint card generation. SwiftUI-based card rendering exported via ImageRenderer. Privacy-safe — no sensitive data in shared output.",
      deps: "Core, MoodCheck",
    },
    {
      module: "Settings",
      submodules: ["AccountSettings", "PrivacyCenter", "NotifPreferences", "AccessibilitySettings", "DataControls"],
      desc: "Full personal control layer. Dialect preference, notification schedule builder, data export/deletion, AI interaction settings, Trust Center access.",
      deps: "Core, Auth",
    },
    {
      module: "Notifications",
      submodules: ["NudgeEngine", "ScheduleManager", "DeliveryTracker", "QuietHours"],
      desc: "Context-aware push notification orchestration. User-defined quiet hours, emotional nudge delivery, morning/evening ritual prompts. UN notification service extension.",
      deps: "Core",
    },
  ];

  const nativeCapabilities = [
    { cap: "CoreHaptics", usage: "Precisely choreographed haptic sequences for emotional moments: check-in confirmation, journal save, companion reply received, streak milestone", differentiator: "Emotional resonance through touch — not available at this quality in cross-platform" },
    { cap: "AVFoundation + Speech", usage: "Arabic TTS with ElevenLabs-generated voice on-device blend. Whisper-powered STT via API. Custom audio player with volume/EQ shaping for guided sessions", differentiator: "Authentic voice companion — the warmth of speech is core to intimacy" },
    { cap: "WidgetKit + AppIntents", usage: "Lock screen widget: daily mood word + companion micro-message. Interactive widget: mood check-in from lock screen (iOS 17+). Spotlight integration", differentiator: "Ambient emotional presence without opening the app" },
    { cap: "UserNotifications + Service Extensions", usage: "Rich push with media attachment, companion avatar, quick-reply actions. Encrypted notification payloads. Delivered Quietly for gentle check-ins", differentiator: "Notification as emotional touchpoint, not alert" },
    { cap: "SwiftData / Core Data", usage: "On-device journal store with NSManagedObjectContext + background contexts. Predicate-based mood timeline queries. Encrypted store option", differentiator: "Instant offline access to full personal archive with zero loading" },
    { cap: "CryptoKit", usage: "AES-GCM-256 encryption of journal entries before sync. Derived symmetric key from biometric-protected keychain entry. Zero-knowledge option", differentiator: "True user-controlled encryption — the privacy promise held architecturally" },
    { cap: "LocalAuthentication + Keychain", usage: "FaceID/TouchID gating for journal access, conversation history. Session tokens stored in Keychain with kSecAttrAccessibleWhenUnlockedThisDeviceOnly", differentiator: "Device-level security befitting emotionally sensitive data" },
    { cap: "NWPathMonitor", usage: "Real-time network state observation. Offline queue for mood check-ins and journal saves. Reconnection-triggered sync with conflict resolution", differentiator: "Zero user-facing degradation on poor connectivity" },
    { cap: "Charts (Swift Charts)", usage: "Mood trend line chart, weekly emotional bar graph, streak visualization. Smooth animations, RTL-compatible axis labels, dark mode native rendering", differentiator: "Beautiful data visualization native to the platform — no web charts" },
    { cap: "HealthKit (opt-in)", usage: "Mindful minutes export, mood data opt-in sharing for health record continuity. Heart rate correlation in Insights (if user enables)", differentiator: "Positions أُنْس within Apple's health ecosystem — powerful trust signal" },
    { cap: "Dynamic Type + Accessibility", usage: "All text respects Dynamic Type scales. VoiceOver semantic labels in Arabic. RTL layout fully supported via .environment(\\.layoutDirection, .rightToLeft)", differentiator: "Emotionally accessible product — serves users in fragile states" },
    { cap: "Background App Refresh", usage: "Silently preloads companion context, syncs mood data, refreshes content library while app is backgrounded — content ready on open", differentiator: "Zero perceived latency on app launch for the core experience" },
  ];

  const backendAgnostic = [
    { principle: "REST + JSON only at the boundary", detail: "The iOS app communicates with the backend exclusively via versioned REST endpoints with JSON payloads. No platform-specific transport, no gRPC-iOS-only bindings. Any future Android or web client speaks the same API." },
    { principle: "Auth via standard OAuth2 / JWT", detail: "Token-based auth with refresh. No Apple-proprietary auth flow exposed at the server. 'Sign in with Apple' produces a standard identity token validated server-side — the backend sees a user ID, not an Apple device." },
    { principle: "Push via APNs → Backend abstraction", detail: "Backend sends notifications via a push notification service (e.g. OneSignal, direct APNs) abstracted behind a notification interface. Adding FCM for Android later requires no backend data model changes." },
    { principle: "AI features are API-routed", detail: "All LLM calls go through the backend provider router — the iOS app sends a message string and receives a structured response. No OpenAI SDK embedded in the iOS client. Provider switching is invisible to the app." },
    { principle: "Media served via CDN", detail: "Guided session audio, images, and content are served from a CDN with standard HTTPS. No iOS-specific media delivery. Android will access the same CDN endpoints." },
    { principle: "Analytics via generic event schema", detail: "Events are JSON objects with: eventName (string), properties (dict), userId (hashed), timestamp, platform (ios | android | web). The backend analytics pipeline is platform-agnostic from day one." },
  ];

  const archRecommendation = {
    pattern: "Modular Clean Architecture + MVVM",
    rationale: [
      "Clean Architecture ensures the domain/business logic is UI-agnostic and fully unit-testable — critical for AI response logic, crisis detection, and personalization rules",
      "MVVM + SwiftUI @Observable gives reactive UI with minimal boilerplate and excellent Xcode preview support for design iteration speed",
      "Modular structure allows feature teams to own their modules independently — faster CI, clear ownership, isolated testing",
      "Protocols at every layer boundary enable dependency injection and mock-based testing of AI, network, and persistence behavior without live services",
    ],
  };

  return (
    <section id="native-ios-strategy" className="py-16 px-8 lg:px-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <span className="text-xs font-mono text-primary tracking-widest uppercase">29</span>
          <h2 className="text-3xl font-bold mt-2 mb-4">Native iOS Architecture & Technology Strategy</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            أُنْس is a premium emotional operating system. It requires the level of performance, interaction fidelity, security depth, and platform integration that only native iOS development can deliver at this quality tier. This section defines the recommended architecture, technology stack, module structure, platform capabilities, and backend strategy for Phase 1 — native iOS exclusively.
          </p>
        </div>

        {/* Strategic Decision Summary */}
        <div className="bg-primary/8 border border-primary/20 rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Strategic Decision</h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            {[
              { label: "Phase 1", value: "Native iOS Only", note: "Swift · SwiftUI · Apple ecosystem" },
              { label: "Phase 2", value: "iOS Maturity Review", note: "After product-market validation" },
              { label: "Phase 3", value: "Android (Separate Phase)", note: "Native Kotlin/Compose — not cross-platform" },
            ].map(p => (
              <div key={p.label}>
                <div className="text-xs font-mono text-primary mb-1">{p.label}</div>
                <div className="font-semibold text-sm mb-1">{p.value}</div>
                <div className="text-xs text-muted-foreground">{p.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 1. Architecture Pattern */}
        <div>
          <h3 className="text-xl font-semibold mb-2">① Recommended Architecture — {archRecommendation.pattern}</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            The product's emotional complexity, AI integration depth, and privacy requirements demand a layered, protocol-driven architecture. The recommendation is Modular Clean Architecture with MVVM presentation — the iOS industry's most proven pattern for complex consumer products.
          </p>
          <div className="bg-card rounded-2xl p-5 border border-border/30 mb-5">
            <h4 className="font-semibold text-sm mb-3">Why This Pattern</h4>
            <div className="space-y-2">
              {archRecommendation.rationale.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  {r}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {archLayers.map((l, i) => (
              <div key={l.layer} className="bg-card rounded-2xl p-4 border border-border/30">
                <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary font-mono">{i + 1}</span>
                    </div>
                    <h4 className="font-semibold text-sm">{l.layer}</h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono bg-primary/8 text-primary px-2 py-0.5 rounded-full">{l.tech}</span>
                    <span className="text-xs text-muted-foreground">{l.pattern}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed ml-10">{l.responsibility}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Technology Choices */}
        <div>
          <h3 className="text-xl font-semibold mb-6">② Technology Choices — Apple Ecosystem</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { choice: "Swift 6", role: "Primary language", reason: "Strict concurrency, actor model for safe async AI streaming, full Apple ecosystem compatibility. No Objective-C new code." },
              { choice: "SwiftUI 5+", role: "Primary UI framework", reason: "Declarative, reactive, RTL-native, Xcode preview iteration speed, WidgetKit/LiveActivity integration. UIKit used only where SwiftUI is insufficient." },
              { choice: "@Observable (iOS 17+) / ObservableObject", role: "State management", reason: "Native reactive state with no third-party state library. Simple, testable, Xcode Instruments-observable. Minimum deployment target: iOS 16." },
              { choice: "Swift Concurrency (async/await + actors)", role: "Async programming", reason: "Structured concurrency for AI streaming, safe background persistence, cancellable network requests. No callback hell, no Combine overhead for simple cases." },
              { choice: "Swift Package Manager", role: "Dependency management", reason: "Apple-native, Xcode-integrated, no Cocoapods fragility. Minimal external dependencies policy — Apple frameworks preferred over third-party." },
              { choice: "SwiftData (iOS 17+) / Core Data", role: "Local persistence", reason: "On-device journal store, mood history, user preferences. Encrypted store option. Predicate-based queries for fast offline retrieval." },
              { choice: "XCTest + Swift Testing", role: "Testing", reason: "Swift Testing (Xcode 16+) for expressive domain tests. XCTest for UI tests. No external test frameworks needed." },
              { choice: "URLSession", role: "Networking", reason: "Native HTTP client with full async/await support. Custom retry logic, timeout control, multi-provider routing. No Alamofire dependency." },
            ].map(t => (
              <div key={t.choice} className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-sm font-mono text-primary">{t.choice}</h4>
                  <span className="text-xs text-muted-foreground">{t.role}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Module Breakdown */}
        <div>
          <h3 className="text-xl font-semibold mb-6">③ Module Breakdown — 10 Product Modules</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            The codebase is structured as a single Xcode project with multiple Swift Package targets — one per module. Modules have explicit dependency declarations. No circular dependencies. Each module is independently buildable and testable.
          </p>
          <div className="space-y-3">
            {modules.map((m, i) => (
              <div key={m.module} className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary font-mono">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm font-mono">{m.module}</h4>
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {m.submodules.map(s => (
                          <span key={s} className="text-xs text-primary/70 font-mono">{s}</span>
                        )).reduce((acc: React.ReactNode[], el, idx, arr) => [
                          ...acc,
                          el,
                          idx < arr.length - 1 ? <span key={`sep-${idx}`} className="text-muted-foreground/30 text-xs">·</span> : null
                        ], [])}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">deps: {m.deps}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed ml-10">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Native Capabilities */}
        <div>
          <h3 className="text-xl font-semibold mb-2">④ Native iOS Capabilities to Leverage</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            These capabilities are either unavailable in cross-platform frameworks or deliver significantly inferior quality when abstracted. They are the primary reason for the native-first decision.
          </p>
          <div className="space-y-3">
            {nativeCapabilities.map(c => (
              <div key={c.cap} className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="font-semibold text-sm font-mono text-primary">{c.cap}</h4>
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full shrink-0">Native advantage</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1.5 leading-relaxed">{c.usage}</p>
                <p className="text-xs text-primary/70 italic">{c.differentiator}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Backend Platform-Agnostic */}
        <div>
          <h3 className="text-xl font-semibold mb-2">⑤ Backend Platform Agnosticism</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            The backend should be designed as if it serves multiple clients from day one — even though only iOS is currently active. This costs near-zero extra effort now and avoids costly restructuring when Android begins.
          </p>
          <div className="space-y-3">
            {backendAgnostic.map(b => (
              <div key={b.principle} className="bg-card rounded-2xl p-5 border border-border/30">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{b.principle}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Closing */}
        <div className="bg-primary/8 border border-primary/20 rounded-2xl p-6">
          <h3 className="font-semibold mb-3">Architecture Summary</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p className="font-medium text-foreground text-xs uppercase tracking-widest mb-2">What is native-first</p>
              {["Every screen, animation, interaction (SwiftUI)", "Every persistence layer (SwiftData, Keychain)", "Every system integration (haptics, audio, notifications, HealthKit)", "Every security boundary (CryptoKit, LocalAuth)", "The entire module tree and dependency graph"].map((i, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  {i}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground text-xs uppercase tracking-widest mb-2">What is platform-agnostic</p>
              {["REST API contracts (versioned, JSON)", "Auth token format (JWT)", "AI request/response schema", "Analytics event schema", "Push notification trigger logic (backend side)", "CDN-served content (audio, images, content JSON)"].map((i, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                  {i}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
