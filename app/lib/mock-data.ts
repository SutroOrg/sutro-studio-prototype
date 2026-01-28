export interface ApplicationVersion {
  label: string;
  createdAt: string;
}

export interface Application {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  slangCode: string;
  mermaidDiagram: string;
  openApiSpec: Record<string, unknown>;
  apiEndpoint: string;
  versions: ApplicationVersion[];
  currentVersion: string;
  empty?: boolean;
}

export const ROLE_OPTIONS: string[] = [
  "Developer",
  "Designer",
  "Product Manager",
  "Engineering Manager",
  "CTO",
  "Other",
];

// ---------------------------------------------------------------------------
// 1. DataStream Pro
// ---------------------------------------------------------------------------

const datastreamSlang = `model Organization {
  description "Tenant workspace. All pipelines and sources are scoped to an Organization."
  group @id
  fields {
    Name: TEXT
      description "Organization display name."
      minLength 2
    Plan: ENUM("free","team","enterprise") := "free"
      description "Subscription tier governing throughput limits."
  }
}

model Pipeline {
  description "A directed data-processing graph that moves records from sources to sinks."
  fields {
    Name: TEXT
      description "Human-readable pipeline label."
      minLength 1
    Status: ENUM("draft","running","paused","failed") := "draft"
      description "Current execution state."
    \`Throughput Limit\`: INTEGER := 10000
      description "Max records per second before back-pressure engages."
    \`Created At\`: DATETIME
      description "Timestamp when the pipeline was first saved."
  }
}

model DataSource {
  description "An external system from which records are ingested."
  fields {
    Name: TEXT
      description "Friendly name for this source."
      minLength 1
    Kind: ENUM("postgres","mysql","kafka","s3","webhook")
      description "Connector type."
    \`Connection URI\`: TEXT
      description "Encrypted connection string."
    Healthy: BOOLEAN := true
      description "Whether the last health-check succeeded."
  }
}

model Transform {
  description "A single transformation step executed inside a pipeline."
  fields {
    Label: TEXT
      description "Short name shown in the pipeline graph."
    Language: ENUM("sql","javascript","python") := "sql"
      description "Runtime used to evaluate the expression."
    Expression: TEXT
      description "Source code of the transform."
    \`Order Index\`: INTEGER
      description "Position of this step in the pipeline."
  }
}

model OutputSink {
  description "A destination where processed records are delivered."
  fields {
    Name: TEXT
      description "Friendly sink name."
      minLength 1
    Kind: ENUM("postgres","bigquery","s3","webhook","elasticsearch")
      description "Destination connector type."
    \`Connection URI\`: TEXT
      description "Encrypted connection string for the sink."
    \`Batch Size\`: INTEGER := 500
      description "Number of records per write batch."
  }
}

relation PipelineBelongsToOrganization {
  description "Every pipeline is owned by exactly one organization."
  Pipeline --> Organization
}

relation DataSourceBelongsToOrganization {
  description "Every data source is owned by exactly one organization."
  DataSource --> Organization
}

relation PipelineHasDataSource {
  description "A pipeline reads from one primary data source."
  Pipeline --> DataSource
}

relation PipelineHasTransforms {
  description "A pipeline contains an ordered set of transforms."
  Pipeline -->> Transform
}

relation PipelineHasOutputSink {
  description "A pipeline writes to one output sink."
  Pipeline --> OutputSink
}

action StartPipeline {
  description "Transition a draft or paused pipeline to running."
  on Pipeline
  when Status = "draft" OR Status = "paused"
  set Status "running"
}

action PausePipeline {
  description "Pause a running pipeline gracefully."
  on Pipeline
  when Status = "running"
  set Status "paused"
}

action ResetPipeline {
  description "Return a failed pipeline to draft so it can be reconfigured."
  on Pipeline
  when Status = "failed"
  set Status "draft"
}

trigger OnPipelineFailed {
  description "Send an alert when a pipeline enters the failed state."
  on Pipeline
  when Status becomes "failed"
  notify Organization
}

trigger OnDataSourceUnhealthy {
  description "Mark dependent pipelines as failed when a source goes down."
  on DataSource
  when Healthy becomes false
  for each Pipeline linked through PipelineHasDataSource
    set Status "failed"
}`;

const datastreamMermaid = `classDiagram
  class Organization {
    +String name
    +String plan
  }
  class Pipeline {
    +String name
    +String status
    +Integer throughputLimit
    +DateTime createdAt
  }
  class DataSource {
    +String name
    +String kind
    +String connectionUri
    +Boolean healthy
  }
  class Transform {
    +String label
    +String language
    +String expression
    +Integer orderIndex
  }
  class OutputSink {
    +String name
    +String kind
    +String connectionUri
    +Integer batchSize
  }
  Organization "1" --> "*" Pipeline
  Organization "1" --> "*" DataSource
  Pipeline "1" --> "1" DataSource
  Pipeline "1" --> "*" Transform
  Pipeline "1" --> "1" OutputSink`;

const datastreamOpenApi = {
  openapi: "3.1.1",
  info: {
    title: "DataStream Pro API",
    version: "1.0.0",
    description: "Manage streaming data pipelines, sources, and sinks.",
  },
  paths: {
    "/pipelines": {
      get: { summary: "List pipelines", operationId: "listPipelines" },
      post: { summary: "Create pipeline", operationId: "createPipeline" },
    },
    "/pipelines/{id}": {
      get: { summary: "Get pipeline", operationId: "getPipeline" },
      put: { summary: "Update pipeline", operationId: "updatePipeline" },
      delete: { summary: "Delete pipeline", operationId: "deletePipeline" },
    },
    "/pipelines/{id}/start": {
      post: { summary: "Start pipeline", operationId: "startPipeline" },
    },
    "/pipelines/{id}/pause": {
      post: { summary: "Pause pipeline", operationId: "pausePipeline" },
    },
    "/data-sources": {
      get: { summary: "List data sources", operationId: "listDataSources" },
      post: { summary: "Create data source", operationId: "createDataSource" },
    },
    "/data-sources/{id}": {
      get: { summary: "Get data source", operationId: "getDataSource" },
      put: { summary: "Update data source", operationId: "updateDataSource" },
      delete: {
        summary: "Delete data source",
        operationId: "deleteDataSource",
      },
    },
    "/transforms": {
      get: { summary: "List transforms", operationId: "listTransforms" },
      post: { summary: "Create transform", operationId: "createTransform" },
    },
    "/transforms/{id}": {
      get: { summary: "Get transform", operationId: "getTransform" },
      put: { summary: "Update transform", operationId: "updateTransform" },
      delete: { summary: "Delete transform", operationId: "deleteTransform" },
    },
    "/output-sinks": {
      get: { summary: "List output sinks", operationId: "listOutputSinks" },
      post: { summary: "Create output sink", operationId: "createOutputSink" },
    },
    "/output-sinks/{id}": {
      get: { summary: "Get output sink", operationId: "getOutputSink" },
      put: { summary: "Update output sink", operationId: "updateOutputSink" },
      delete: {
        summary: "Delete output sink",
        operationId: "deleteOutputSink",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 2. RenderMaster
// ---------------------------------------------------------------------------

const rendermasterSlang = `model Studio {
  description "Top-level workspace that owns scenes, assets, and render jobs."
  group @id
  fields {
    Name: TEXT
      description "Studio display name."
      minLength 2
    \`Max Concurrent Jobs\`: INTEGER := 5
      description "How many render jobs can run in parallel."
    Plan: ENUM("indie","pro","enterprise") := "indie"
      description "Subscription tier controlling GPU quota."
  }
}

model Scene {
  description "A 3-D scene composed of assets, lights, and camera rigs."
  fields {
    Title: TEXT
      description "Scene title shown in the project browser."
      minLength 1
    \`Poly Count\`: INTEGER
      description "Total polygon count across all meshes."
    \`Frame Range Start\`: INTEGER := 1
      description "First frame of the animation timeline."
    \`Frame Range End\`: INTEGER := 250
      description "Last frame of the animation timeline."
  }
}

model Asset {
  description "A reusable 3-D asset such as a mesh, material, or texture."
  fields {
    Name: TEXT
      description "Asset file name."
      minLength 1
    Kind: ENUM("mesh","material","texture","hdri","rig")
      description "Category of the asset."
    \`File Size MB\`: FLOAT
      description "Size of the source file in megabytes."
    Format: ENUM("fbx","gltf","obj","usd","blend") := "gltf"
      description "File format."
  }
}

model RenderJob {
  description "A queued or completed render of a scene."
  fields {
    Label: TEXT
      description "User-defined job label."
    Status: ENUM("queued","rendering","completed","cancelled","errored") := "queued"
      description "Current lifecycle state."
    Engine: ENUM("cycles","eevee","arnold","vray") := "cycles"
      description "Render engine to use."
    \`Resolution X\`: INTEGER := 1920
      description "Output horizontal resolution in pixels."
    \`Resolution Y\`: INTEGER := 1080
      description "Output vertical resolution in pixels."
    \`Samples\`: INTEGER := 256
      description "Ray-tracing sample count."
    \`Started At\`: DATETIME
      description "Timestamp when rendering began."
  }
}

model OutputFrame {
  description "A single rendered frame produced by a render job."
  fields {
    \`Frame Number\`: INTEGER
      description "The timeline frame this image represents."
    Format: ENUM("exr","png","jpg","tiff") := "exr"
      description "Image format."
    \`File Size MB\`: FLOAT
      description "Size of the output file."
    \`Render Time Seconds\`: FLOAT
      description "Wall-clock time to render this frame."
  }
}

relation SceneBelongsToStudio {
  description "Every scene is owned by a studio."
  Scene --> Studio
}

relation AssetBelongsToStudio {
  description "Assets are stored at the studio level for reuse."
  Asset --> Studio
}

relation SceneUsesAssets {
  description "A scene references zero or more assets."
  Scene -->> Asset
}

relation RenderJobTargetsScene {
  description "Each render job renders exactly one scene."
  RenderJob --> Scene
}

relation RenderJobProducesFrames {
  description "A completed job produces one output frame per timeline frame."
  RenderJob -->> OutputFrame
}

action QueueRender {
  description "Submit a new render job for a scene."
  on RenderJob
  when Status = "queued"
  set Status "rendering"
}

action CancelRender {
  description "Cancel a queued or in-progress render job."
  on RenderJob
  when Status = "queued" OR Status = "rendering"
  set Status "cancelled"
}

action RetryRender {
  description "Re-queue an errored render job."
  on RenderJob
  when Status = "errored"
  set Status "queued"
}

trigger OnRenderCompleted {
  description "Notify the studio owner when a render job finishes."
  on RenderJob
  when Status becomes "completed"
  notify Studio
}

trigger OnRenderErrored {
  description "Alert and free GPU quota when a render job errors."
  on RenderJob
  when Status becomes "errored"
  notify Studio
}`;

const rendermasterMermaid = `classDiagram
  class Studio {
    +String name
    +Integer maxConcurrentJobs
    +String plan
  }
  class Scene {
    +String title
    +Integer polyCount
    +Integer frameRangeStart
    +Integer frameRangeEnd
  }
  class Asset {
    +String name
    +String kind
    +Float fileSizeMB
    +String format
  }
  class RenderJob {
    +String label
    +String status
    +String engine
    +Integer resolutionX
    +Integer resolutionY
    +Integer samples
    +DateTime startedAt
  }
  class OutputFrame {
    +Integer frameNumber
    +String format
    +Float fileSizeMB
    +Float renderTimeSeconds
  }
  Studio "1" --> "*" Scene
  Studio "1" --> "*" Asset
  Scene "*" --> "*" Asset
  RenderJob "1" --> "1" Scene
  RenderJob "1" --> "*" OutputFrame`;

const rendermasterOpenApi = {
  openapi: "3.1.1",
  info: {
    title: "RenderMaster API",
    version: "1.0.0",
    description: "Manage 3-D scenes, assets, and GPU render jobs.",
  },
  paths: {
    "/scenes": {
      get: { summary: "List scenes", operationId: "listScenes" },
      post: { summary: "Create scene", operationId: "createScene" },
    },
    "/scenes/{id}": {
      get: { summary: "Get scene", operationId: "getScene" },
      put: { summary: "Update scene", operationId: "updateScene" },
      delete: { summary: "Delete scene", operationId: "deleteScene" },
    },
    "/assets": {
      get: { summary: "List assets", operationId: "listAssets" },
      post: { summary: "Upload asset", operationId: "createAsset" },
    },
    "/assets/{id}": {
      get: { summary: "Get asset", operationId: "getAsset" },
      put: { summary: "Update asset", operationId: "updateAsset" },
      delete: { summary: "Delete asset", operationId: "deleteAsset" },
    },
    "/render-jobs": {
      get: { summary: "List render jobs", operationId: "listRenderJobs" },
      post: { summary: "Queue render job", operationId: "createRenderJob" },
    },
    "/render-jobs/{id}": {
      get: { summary: "Get render job", operationId: "getRenderJob" },
      delete: { summary: "Cancel render job", operationId: "cancelRenderJob" },
    },
    "/render-jobs/{id}/retry": {
      post: { summary: "Retry render job", operationId: "retryRenderJob" },
    },
    "/output-frames": {
      get: { summary: "List output frames", operationId: "listOutputFrames" },
    },
    "/output-frames/{id}": {
      get: { summary: "Get output frame", operationId: "getOutputFrame" },
    },
  },
};

// ---------------------------------------------------------------------------
// 3. CacheGuard
// ---------------------------------------------------------------------------

const cacheguardSlang = `model Organization {
  description "Account that owns namespaces, policies, and cache entries."
  group @id
  fields {
    Name: TEXT
      description "Organization name."
      minLength 2
    Plan: ENUM("free","pro","enterprise") := "free"
      description "Tier that determines max memory and entry count."
    \`Memory Limit MB\`: INTEGER := 512
      description "Total memory budget across all namespaces."
  }
}

model Namespace {
  description "Logical partition within an organization for grouping related cache entries."
  fields {
    Name: TEXT
      description "Namespace identifier used in API keys."
      minLength 1
    \`Max Entries\`: INTEGER := 100000
      description "Maximum number of entries this namespace may hold."
    \`Current Entry Count\`: INTEGER := 0
      description "Live count of entries stored."
    Enabled: BOOLEAN := true
      description "Whether reads and writes are accepted."
  }
}

model CachePolicy {
  description "A set of rules governing TTL, eviction, and write behaviour."
  fields {
    Name: TEXT
      description "Policy label."
      minLength 1
    \`Default TTL Seconds\`: INTEGER := 3600
      description "Time-to-live applied when no explicit TTL is set."
    \`Max TTL Seconds\`: INTEGER := 86400
      description "Hard upper bound on any entry TTL."
    \`Write Mode\`: ENUM("write-through","write-back","write-around") := "write-through"
      description "Strategy for propagating writes to the backing store."
  }
}

model CacheEntry {
  description "A single key-value pair stored in a namespace."
  fields {
    Key: TEXT
      description "Unique lookup key within the namespace."
      minLength 1
    \`Value Size Bytes\`: INTEGER
      description "Size of the stored value."
    \`Content Type\`: ENUM("json","string","binary","protobuf") := "json"
      description "Serialization format of the value."
    \`TTL Seconds\`: INTEGER
      description "Remaining time-to-live."
    \`Hit Count\`: INTEGER := 0
      description "Number of reads since creation."
    \`Created At\`: DATETIME
      description "Timestamp when the entry was written."
  }
}

model EvictionRule {
  description "A rule that determines which entries are evicted when memory is full."
  fields {
    Name: TEXT
      description "Rule label."
    Strategy: ENUM("lru","lfu","fifo","ttl","random") := "lru"
      description "Eviction algorithm."
    Priority: INTEGER := 0
      description "Higher priority rules are evaluated first."
    \`Min Age Seconds\`: INTEGER := 60
      description "Entries younger than this are exempt from eviction."
  }
}

relation NamespaceBelongsToOrganization {
  description "Each namespace belongs to one organization."
  Namespace --> Organization
}

relation CachePolicyBelongsToNamespace {
  description "Each namespace has exactly one active cache policy."
  CachePolicy --> Namespace
}

relation CacheEntryBelongsToNamespace {
  description "Every entry is stored inside a namespace."
  CacheEntry --> Namespace
}

relation EvictionRuleBelongsToNamespace {
  description "Eviction rules are scoped to a namespace."
  EvictionRule --> Namespace
}

action FlushNamespace {
  description "Delete all entries in a namespace without removing the namespace itself."
  on Namespace
  set \`Current Entry Count\` 0
}

action DisableNamespace {
  description "Temporarily disable reads and writes for a namespace."
  on Namespace
  when Enabled = true
  set Enabled false
}

action EnableNamespace {
  description "Re-enable a disabled namespace."
  on Namespace
  when Enabled = false
  set Enabled true
}

trigger OnEntryExpired {
  description "Decrement the namespace entry count when an entry TTL reaches zero."
  on CacheEntry
  when \`TTL Seconds\` becomes 0
  for parent Namespace
    decrement \`Current Entry Count\`
}

trigger OnNamespaceFull {
  description "Run eviction rules when the namespace entry count hits the limit."
  on Namespace
  when \`Current Entry Count\` >= \`Max Entries\`
  evaluate EvictionRule ordered by Priority descending
}`;

const cacheguardMermaid = `classDiagram
  class Organization {
    +String name
    +String plan
    +Integer memoryLimitMB
  }
  class Namespace {
    +String name
    +Integer maxEntries
    +Integer currentEntryCount
    +Boolean enabled
  }
  class CachePolicy {
    +String name
    +Integer defaultTTLSeconds
    +Integer maxTTLSeconds
    +String writeMode
  }
  class CacheEntry {
    +String key
    +Integer valueSizeBytes
    +String contentType
    +Integer ttlSeconds
    +Integer hitCount
    +DateTime createdAt
  }
  class EvictionRule {
    +String name
    +String strategy
    +Integer priority
    +Integer minAgeSeconds
  }
  Organization "1" --> "*" Namespace
  Namespace "1" --> "1" CachePolicy
  Namespace "1" --> "*" CacheEntry
  Namespace "1" --> "*" EvictionRule`;

const cacheguardOpenApi = {
  openapi: "3.1.1",
  info: {
    title: "CacheGuard API",
    version: "1.0.0",
    description:
      "Manage cache namespaces, policies, entries, and eviction rules.",
  },
  paths: {
    "/namespaces": {
      get: { summary: "List namespaces", operationId: "listNamespaces" },
      post: { summary: "Create namespace", operationId: "createNamespace" },
    },
    "/namespaces/{id}": {
      get: { summary: "Get namespace", operationId: "getNamespace" },
      put: { summary: "Update namespace", operationId: "updateNamespace" },
      delete: { summary: "Delete namespace", operationId: "deleteNamespace" },
    },
    "/namespaces/{id}/flush": {
      post: { summary: "Flush namespace", operationId: "flushNamespace" },
    },
    "/namespaces/{id}/disable": {
      post: { summary: "Disable namespace", operationId: "disableNamespace" },
    },
    "/namespaces/{id}/enable": {
      post: { summary: "Enable namespace", operationId: "enableNamespace" },
    },
    "/cache-policies": {
      get: { summary: "List cache policies", operationId: "listCachePolicies" },
      post: {
        summary: "Create cache policy",
        operationId: "createCachePolicy",
      },
    },
    "/cache-policies/{id}": {
      get: { summary: "Get cache policy", operationId: "getCachePolicy" },
      put: {
        summary: "Update cache policy",
        operationId: "updateCachePolicy",
      },
      delete: {
        summary: "Delete cache policy",
        operationId: "deleteCachePolicy",
      },
    },
    "/cache-entries": {
      get: { summary: "List cache entries", operationId: "listCacheEntries" },
      post: { summary: "Set cache entry", operationId: "createCacheEntry" },
    },
    "/cache-entries/{key}": {
      get: { summary: "Get cache entry", operationId: "getCacheEntry" },
      delete: {
        summary: "Delete cache entry",
        operationId: "deleteCacheEntry",
      },
    },
    "/eviction-rules": {
      get: {
        summary: "List eviction rules",
        operationId: "listEvictionRules",
      },
      post: {
        summary: "Create eviction rule",
        operationId: "createEvictionRule",
      },
    },
    "/eviction-rules/{id}": {
      get: { summary: "Get eviction rule", operationId: "getEvictionRule" },
      put: {
        summary: "Update eviction rule",
        operationId: "updateEvictionRule",
      },
      delete: {
        summary: "Delete eviction rule",
        operationId: "deleteEvictionRule",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 4. StyleCraft
// ---------------------------------------------------------------------------

const stylecraftSlang = `model Workspace {
  description "Top-level container for a design-system team."
  group @id
  fields {
    Name: TEXT
      description "Workspace display name."
      minLength 2
    Plan: ENUM("starter","professional","enterprise") := "starter"
      description "Subscription tier."
  }
}

model Theme {
  description "A named collection of design tokens that can be applied to a project."
  fields {
    Name: TEXT
      description "Theme name, e.g. 'Light', 'Dark', 'High-Contrast'."
      minLength 1
    Mode: ENUM("light","dark","high-contrast","custom") := "light"
      description "Base appearance mode."
    Published: BOOLEAN := false
      description "Whether this theme is visible to consumers."
    \`Published At\`: DATETIME
      description "Timestamp of last publish."
  }
}

model DesignToken {
  description "A single named value such as a colour, spacing unit, or font size."
  fields {
    Name: TEXT
      description "Token name using dot notation, e.g. 'color.primary.500'."
      minLength 1
    Category: ENUM("color","spacing","typography","elevation","border-radius","opacity")
      description "Semantic category."
    Value: TEXT
      description "Resolved value, e.g. '#6366f1' or '16px'."
    \`CSS Variable\`: TEXT
      description "Generated CSS custom property name."
    Description: TEXT
      description "Usage guidance for consumers."
  }
}

model ColorPalette {
  description "A curated set of colour swatches organised into scales."
  fields {
    Name: TEXT
      description "Palette name, e.g. 'Indigo', 'Neutral', 'Success'."
      minLength 1
    \`Base Hue\`: INTEGER
      description "Hue angle (0-360) used to generate the scale."
    Steps: INTEGER := 10
      description "Number of lightness steps in the scale."
    \`Contrast Ratio Min\`: FLOAT := 4.5
      description "Minimum WCAG contrast ratio enforced for text pairs."
  }
}

model Component {
  description "A UI component whose styling is driven by design tokens."
  fields {
    Name: TEXT
      description "Component name, e.g. 'Button', 'Card', 'Input'."
      minLength 1
    Category: ENUM("primitive","composite","layout","feedback","navigation")
      description "Component taxonomy level."
    Status: ENUM("draft","review","stable","deprecated") := "draft"
      description "Lifecycle status."
    \`Figma Link\`: URL
      description "Link to the canonical Figma component."
    \`Token Count\`: INTEGER := 0
      description "Number of design tokens bound to this component."
  }
}

relation ThemeBelongsToWorkspace {
  description "Each theme is owned by a workspace."
  Theme --> Workspace
}

relation DesignTokenBelongsToTheme {
  description "Tokens are scoped to a specific theme."
  DesignToken --> Theme
}

relation ColorPaletteBelongsToTheme {
  description "Palettes are defined within a theme."
  ColorPalette --> Theme
}

relation ComponentBelongsToWorkspace {
  description "Components live at the workspace level."
  Component --> Workspace
}

relation ComponentUsesTokens {
  description "A component references one or more design tokens."
  Component -->> DesignToken
}

action PublishTheme {
  description "Mark a theme as published so consumers can pull tokens."
  on Theme
  when Published = false
  set Published true
}

action UnpublishTheme {
  description "Retract a published theme."
  on Theme
  when Published = true
  set Published false
}

action PromoteComponent {
  description "Advance a component from draft to review."
  on Component
  when Status = "draft"
  set Status "review"
}

action StabilizeComponent {
  description "Mark a reviewed component as stable."
  on Component
  when Status = "review"
  set Status "stable"
}

trigger OnThemePublished {
  description "Regenerate CSS custom-property files when a theme is published."
  on Theme
  when Published becomes true
  for each DesignToken linked through DesignTokenBelongsToTheme
    regenerate \`CSS Variable\`
}

trigger OnTokenValueChanged {
  description "Increment token count on parent component when a token value changes."
  on DesignToken
  when Value changes
  for each Component linked through ComponentUsesTokens
    recalculate \`Token Count\`
}`;

const stylecraftMermaid = `classDiagram
  class Workspace {
    +String name
    +String plan
  }
  class Theme {
    +String name
    +String mode
    +Boolean published
    +DateTime publishedAt
  }
  class DesignToken {
    +String name
    +String category
    +String value
    +String cssVariable
    +String description
  }
  class ColorPalette {
    +String name
    +Integer baseHue
    +Integer steps
    +Float contrastRatioMin
  }
  class Component {
    +String name
    +String category
    +String status
    +URL figmaLink
    +Integer tokenCount
  }
  Workspace "1" --> "*" Theme
  Workspace "1" --> "*" Component
  Theme "1" --> "*" DesignToken
  Theme "1" --> "*" ColorPalette
  Component "*" --> "*" DesignToken`;

const stylecraftOpenApi = {
  openapi: "3.1.1",
  info: {
    title: "StyleCraft API",
    version: "1.0.0",
    description:
      "Manage design tokens, themes, colour palettes, and components.",
  },
  paths: {
    "/themes": {
      get: { summary: "List themes", operationId: "listThemes" },
      post: { summary: "Create theme", operationId: "createTheme" },
    },
    "/themes/{id}": {
      get: { summary: "Get theme", operationId: "getTheme" },
      put: { summary: "Update theme", operationId: "updateTheme" },
      delete: { summary: "Delete theme", operationId: "deleteTheme" },
    },
    "/themes/{id}/publish": {
      post: { summary: "Publish theme", operationId: "publishTheme" },
    },
    "/themes/{id}/unpublish": {
      post: { summary: "Unpublish theme", operationId: "unpublishTheme" },
    },
    "/design-tokens": {
      get: { summary: "List design tokens", operationId: "listDesignTokens" },
      post: {
        summary: "Create design token",
        operationId: "createDesignToken",
      },
    },
    "/design-tokens/{id}": {
      get: { summary: "Get design token", operationId: "getDesignToken" },
      put: {
        summary: "Update design token",
        operationId: "updateDesignToken",
      },
      delete: {
        summary: "Delete design token",
        operationId: "deleteDesignToken",
      },
    },
    "/color-palettes": {
      get: { summary: "List colour palettes", operationId: "listColorPalettes" },
      post: {
        summary: "Create colour palette",
        operationId: "createColorPalette",
      },
    },
    "/color-palettes/{id}": {
      get: { summary: "Get colour palette", operationId: "getColorPalette" },
      put: {
        summary: "Update colour palette",
        operationId: "updateColorPalette",
      },
      delete: {
        summary: "Delete colour palette",
        operationId: "deleteColorPalette",
      },
    },
    "/components": {
      get: { summary: "List components", operationId: "listComponents" },
      post: { summary: "Create component", operationId: "createComponent" },
    },
    "/components/{id}": {
      get: { summary: "Get component", operationId: "getComponent" },
      put: { summary: "Update component", operationId: "updateComponent" },
      delete: { summary: "Delete component", operationId: "deleteComponent" },
    },
    "/components/{id}/promote": {
      post: {
        summary: "Promote component to review",
        operationId: "promoteComponent",
      },
    },
    "/components/{id}/stabilize": {
      post: {
        summary: "Stabilize component",
        operationId: "stabilizeComponent",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Default application set
// ---------------------------------------------------------------------------

export const DEFAULT_APPLICATIONS: Application[] = [
  {
    id: "datastream-pro",
    name: "DataStream Pro",
    description:
      "Real-time data streaming platform for building ETL pipelines with configurable sources, transforms, and sinks.",
    createdAt: "2025-09-14T10:30:00Z",
    slangCode: datastreamSlang,
    mermaidDiagram: datastreamMermaid,
    openApiSpec: datastreamOpenApi,
    apiEndpoint: "datastream-pro.app.withsutro.com/api/v1.0.1",
    versions: [
      { label: "v1.0.1", createdAt: "2025-09-14T10:30:00Z" },
      { label: "v1.0.0", createdAt: "2025-09-10T08:00:00Z" },
    ],
    currentVersion: "v1.0.1",
  },
  {
    id: "rendermaster",
    name: "RenderMaster",
    description:
      "Cloud 3-D rendering service for managing scenes, assets, and GPU render jobs at scale.",
    createdAt: "2025-10-02T14:15:00Z",
    slangCode: rendermasterSlang,
    mermaidDiagram: rendermasterMermaid,
    openApiSpec: rendermasterOpenApi,
    apiEndpoint: "rendermaster.app.withsutro.com/api/v1.0.1",
    versions: [
      { label: "v1.0.1", createdAt: "2025-10-02T14:15:00Z" },
      { label: "v1.0.0", createdAt: "2025-09-28T11:00:00Z" },
      { label: "v0.9.0", createdAt: "2025-09-20T09:30:00Z" },
    ],
    currentVersion: "v1.0.1",
  },
  {
    id: "cacheguard",
    name: "CacheGuard",
    description:
      "High-performance caching service with namespace isolation, configurable eviction, and real-time analytics.",
    createdAt: "2025-11-20T09:00:00Z",
    slangCode: cacheguardSlang,
    mermaidDiagram: cacheguardMermaid,
    openApiSpec: cacheguardOpenApi,
    apiEndpoint: "cacheguard.app.withsutro.com/api/v1.0.1",
    versions: [
      { label: "v1.0.1", createdAt: "2025-11-20T09:00:00Z" },
      { label: "v1.0.0", createdAt: "2025-11-15T16:00:00Z" },
    ],
    currentVersion: "v1.0.1",
  },
  {
    id: "stylecraft",
    name: "StyleCraft",
    description:
      "Design system manager for maintaining tokens, themes, colour palettes, and component inventories.",
    createdAt: "2025-12-05T16:45:00Z",
    slangCode: stylecraftSlang,
    mermaidDiagram: stylecraftMermaid,
    openApiSpec: stylecraftOpenApi,
    apiEndpoint: "stylecraft.app.withsutro.com/api/v1.0.1",
    versions: [
      { label: "v1.0.1", createdAt: "2025-12-05T16:45:00Z" },
      { label: "v1.0.0", createdAt: "2025-12-01T10:00:00Z" },
      { label: "v0.9.1", createdAt: "2025-11-25T14:30:00Z" },
      { label: "v0.9.0", createdAt: "2025-11-18T09:00:00Z" },
    ],
    currentVersion: "v1.0.1",
  },
];
