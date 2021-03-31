cd $(dirname $0)
git add .
time=$(date "+%Y-%m-%d %H:%M:%S")
git commit -m"commit at ${time}: $1"
git push origin $2
