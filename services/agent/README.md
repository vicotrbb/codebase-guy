# Codebase Guy Agent

The Codebase Guy Agent is a powerful file system monitoring and code indexing service that processes your codebase to enable semantic code search and understanding. It's designed to work seamlessly with the Codebase Guy platform, providing real-time codebase analysis and embedding generation.

## Features

- 🔍 Real-time file system monitoring
- 🧠 Intelligent code chunking using AST analysis
- 🚀 Code embedding generation using CodeBERT
- 💓 Heartbeat mechanism for reliable connection
- 🔄 Automatic file change detection and processing
- 🌐 Cross-platform support (Linux, macOS, Windows)

## Quick Start

### Using Pre-built Binaries

Download the appropriate binary for your platform from our executables:

- [Linux (x64)](https://github.com/vicotrbb/codebase-guy/blob/main/services/agent/executables/guy-agent-linux)
- [macOS (x64)](https://github.com/vicotrbb/codebase-guy/blob/main/services/agent/executables/guy-agent-macos)
- [Windows (x64)](https://github.com/vicotrbb/codebase-guy/blob/main/services/agent/executables/guy-agent-win.exe)

Make the binary executable (Unix-based systems):

```bash
chmod +x guy-agent-*
```

### Building from Source

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. (Optional) Create executables:

```bash
npm run pkg
```

## Usage

### Command Line Arguments

```bash
guy-agent-xxx --folder <path> --project <name> [options]
```

#### Required Arguments:

- `--folder, -f`: Path to the project folder to scan (default: ".")
- `--project, -p`: Project name (default: "Unknown")

#### Optional Arguments:

- `--baseUrl, -r`: Base URL for the Codebase Guy server (default: "http://localhost:3000")
- `--heartbeatInterval, -i`: Interval for heartbeat signals in milliseconds

### Example Usage

```bash
# Using binary
./guy-agent-macos -f /path/to/project -p "My Project" -r http://my-server:3000

# Using npm
npm run agent -- -f /path/to/project -p "My Project"
```

## System Requirements

- **Memory**: Minimum 512MB RAM, Recommended 1GB+
- **Storage**: Varies based on codebase size (approximately 1.5x codebase size for embeddings)
- **CPU**: Multi-core processor recommended for better performance
- **Network**: Stable internet connection required for embedding generation

## Performance Considerations

1. **Initial Scan**

   - The agent performs a full scan of your codebase on startup
   - Processing time depends on codebase size and complexity
   - Expect ~100ms per file for initial embedding generation

2. **Real-time Monitoring**

   - Minimal impact during idle state (<1% CPU usage)
   - File changes trigger immediate processing
   - Embedding generation occurs asynchronously to minimize performance impact

3. **Resource Usage**
   - Memory usage scales with the number of files being monitored
   - Peak memory usage during embedding generation
   - Network bandwidth usage depends on code change frequency

## Architecture

The agent operates as part of a larger system:

```
┌─────────────┐    ┌──────────────┐    ┌────────────────┐
│  Codebase   │    │   Agent      │    │  Embedding     │
│  Guy Server │◄───┤  (This Tool) │◄───┤   Service      │
└─────────────┘    └──────────────┘    └────────────────┘
                          ▲
                          │
                   ┌──────────────┐
                   │  Your        │
                   │  Codebase    │
                   └──────────────┘
```

## Security

- The agent only reads file contents; no write operations are performed
- All communication with external services uses HTTPS
- No sensitive data is stored locally
- Code chunks are processed in memory and immediately discarded after embedding generation

## Troubleshooting

1. **High CPU Usage**

   - Check the size of monitored directories
   - Exclude large binary files or build directories
   - Adjust the heartbeat interval

2. **Connection Issues**

   - Verify server URLs are correct and accessible
   - Check network firewall settings
   - Ensure the embedding service is running

3. **Missing Files**
   - Verify file permissions
   - Check the ignored files patterns
   - Ensure the agent has access to all directories

## License

MIT License - See LICENSE file for details

## Author

Created by Victor Bona

## Contributing

Contributions are welcome! Please read our contributing guidelines for details on our code of conduct and the process for submitting pull requests.
