export default async function setupLivereloadMiddleware(app) {
    const livereload = (await import('livereload')).default;
    const connectLivereload = (await import('connect-livereload')).default;

    const liveReloadServer = livereload.createServer();
    liveReloadServer.watch('public');
    app.use(connectLivereload());

    liveReloadServer.server.once('connection', () => {
        setTimeout(() => {
            liveReloadServer.refresh('/');
        }, 100);
    });
}
