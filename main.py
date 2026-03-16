print("Kiritilgan sonning kvadratini hisoblovchi dastur.")
savol = ("Istalgan sonni kiriting ")
savol += "(dasturni to'xtatish uchun 'exit' deb yozing):"
qiymat = ''
while  qiymat != 'exit':
    qiymat = input(savol)
    if qiymat != 'exit':
        print(int(qiymat)**2)
print("Dastur to'xtadi!")