# NiIM Hosting: Render

NiIM is ready to host on Render as one Node web service. Render will run the backend, serve the built React app, and store the one-device login database on a persistent disk.

## Recommended Render Setup

Use the included `render.yaml` blueprint, or create the service manually.

### Manual Settings

- Service type: Web Service
- Runtime: Node
- Build command: `pnpm install && pnpm run build`
- Start command: `pnpm start`
- Health check path: `/health`

### Environment Variables

- `NIIM_DATA_DIR=/var/data`

### Persistent Disk

Add a persistent disk:

```text
Mount path: /var/data
Size: 1 GB
```

This is where NiIM stores the one-device lock, authenticator secret, and auth events. Without the disk, your lock could reset after deploys.

## First Login

The first phone/browser to open the deployed Render URL registers itself. NiIM then shows the authenticator setup key. After that, other devices are blocked even if they know the authenticator code.

## Local Development

Use two terminals:

```bash
pnpm run dev:backend
```

```bash
pnpm run dev
```
