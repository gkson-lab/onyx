// The app is exported as static files, which the Onyx server serves next to its API: one process, one address.
/** @type {import('next').NextConfig} */
export default { output: 'export', images: { unoptimized: true }, reactStrictMode: true };
