set -e

destination="test"

if [ $# -gt 0 ]; then
  destination=$1
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)


echo "Moving from $CURRENT_BRANCH to $destination."

if [ "$destination" == "test" ]; then
  DEST=$WEBBASE"nordburg.ca/calculators/taxCalc/"
  echo "Going to test.  Moving files from dest to $DEST"
  rsync -rlpcgoDv dist/ $DEST
elif [ "$destination" == "dev" ] || [ "$destination" == "prod" ]; then
  if ! git diff-index --quiet HEAD -- ; then
    echo "You have uncommitted changes. Commit or stash them before running this script."
    exit 1
  fi

  if [ "$destination" == "prod" ]; then
    destination="main"
  fi
  echo "Going to $destination."
  if git show-ref --quiet refs/heads/$destination; then
    echo "Branch '$destination' exists locally. Checking it out."
    git checkout $destination
  else
    echo "Branch '$destination' does not exist locally. Creating it."
    git checkout -b $destination
  fi
  git pull origin $destination
  git merge $CURRENT_BRANCH --no-edit
  git push origin $destination
  git checkout $CURRENT_BRANCH
fi

echo "Exiting"
exit 0
