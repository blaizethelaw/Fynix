self.addEventListener('message', (event: any) => {
  if (event.data && event.data.type === 'SKIP_WAITING') (self as any).skipWaiting()
})
