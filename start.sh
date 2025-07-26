if [ -z $SOURCE_CODE ]
then
  echo "Cloning main Repository"
  git clone https://github.com/kariuki727/adlinkbot.git /URL-Shortener-V2
else
  echo "Cloning Custom Repo from $SOURCE_CODE "
  git clone $SOURCE_CODE /adlinkbot
fi
cd /adlinkbot
pip3 install -U -r requirements.txt
echo "Starting Bot...."
python3 main.py
