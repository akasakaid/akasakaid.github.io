import json

answer_path = "blum/answer.json"

task_id = input("input task id : ")
answer = input("input answer : ")
answers = json.loads(open(answer_path).read())
answers[task_id] = answer
open(answer_path,"w").write(json.dumps(answers,indent=4))
