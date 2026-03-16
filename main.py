print("Kiritilgan sonning kvadratini hisoblovchi dastur.")
savol = ("Istalgan sonni kiriting ")
savol += "(dasturni toxtatish uchun 'exit' deb yozing):"
qiymat = ''
while  qiymat != 'exit':
    qiymat = input(savol)
    if qiymat != 'exit':
        print(int(qiymat)**2)
print("Dastur tugadi!")