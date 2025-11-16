echo "Waiting for Strapi..."
for i in {1..40}; do
  if curl -s http://127.0.0.1:1337 >/dev/null; then
    echo "Strapi is ready!"
    break
  fi
  echo "Strapi not ready yet... ($i)"
  sleep 3
done