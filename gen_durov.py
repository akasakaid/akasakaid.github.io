import json
from datetime import datetime,timezone

durov = input("input separate by -\ninput : ")
one, two, three, four = durov.split("-")
data = {
    "choice_1": int(one),
    "choice_2": int(two),
    "choice_3": int(three),
    "choice_4": int(four),
}
today = datetime.now(tz=timezone.utc).isoformat().split("T")[0]
with open("major/durov.json") as durov:
    jurov = json.loads(durov.read())
    is_today = jurov.get("today")
    if not is_today:
        jurov[today] = data
    with open("major/durov.json", "w") as wrov:
        wrov.write(json.dumps(jurov, indent=4))
