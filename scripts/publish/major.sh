cd "$(git rev-parse --show-toplevel)"
node -e "const p=require('./package.json');const[a,b,c]=p.version.split('.').map(Number);p.version=(a+1)+'.0.0';require('fs').writeFileSync('package.json',JSON.stringify(p,null,2)+'\n')"
VERSION=$(jq -r .version package.json)
git add package.json
git commit -m "release: v$VERSION"
git tag "v$VERSION"
git push origin main --tags
echo "Tagged and pushed v$VERSION — CI will build and create a draft release."
