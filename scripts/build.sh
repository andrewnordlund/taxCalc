echo "You're currently working in:"
pwd

cleanUp="true"

if [ $# -gt 0 ]; then
  if [ $1 == "false"]; then
    cleanUp="false"
  fi 
fi

if [ -d dist ]; then
  rm -Rf dist
fi
if [ -d build ]; then
  rm -Rf build
fi

mkdir dist build
cp -R src/* build/
cp -R build/* dist/
#ls -Rl

if [ "$cleanUp" == "true" ]; then
  rm -Rf build
fi

