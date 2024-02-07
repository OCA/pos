def get_trigram(*args):
    valid = [x.strip() for x in args if x and x.strip()]
    if valid:
        if len(valid) > 1:
            trigram = valid[0][:1] + valid[1][:2]
        else:
            trigram = valid[0][:3]
    else:
        trigram = ""

    return trigram
