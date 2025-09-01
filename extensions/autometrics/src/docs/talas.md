graph TD
    A["TalasRefactored.tsx<br/>(108 lines)<br/>🎯 Main orchestrator"] --> B["useCoordinates<br/>📊 State management"]
    A --> C["useEventHandlers<br/>🖱️ Click & mouse events"]
    A --> D["useAnnotations<br/>📍 Annotation system"]
    A --> E["TalasHeader<br/>🔙 Header component"]
    A --> F["CoordinateGroup<br/>📋 Input groups"]
    A --> G["PopupModal<br/>🖼️ Modal dialog"]
    A --> H["LogoSection<br/>🏢 Branding"]

    C --> I["AnnotationManager<br/>🔧 Annotation utilities"]
    D --> I

    B --> J["Coordinates State<br/>📐 M1, M5, C, T values"]
    B --> K["Selection State<br/>🎯 Active group"]

    C --> L["Event Listeners<br/>👂 Right-click capture"]
    C --> M["Mouse Handlers<br/>🖱️ Viewport interaction"]

    D --> N["Viewport Updates<br/>🔄 Position tracking"]
    D --> O["Crosshair Sync<br/>➕ Multi-viewport sync"]

    I --> P["Element Creation<br/>🏗️ DOM manipulation"]
    I --> Q["Position Updates<br/>📏 Screen coordinates"]

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style I fill:#fce4ec
