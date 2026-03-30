cd "$(git rev-parse --show-toplevel)"
bun version patch
VERSION=$(jq -r .version package.json)
git add package.json
git commit -m "release: v$VERSION"
git tag "v$VERSION"
git push origin main --tags
echo "Tagged and pushed v$VERSION — CI will build and create a draft release."
