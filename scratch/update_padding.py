import glob

files = [
    'src/app/admin/bookings/page.tsx',
    'src/app/admin/courts/page.tsx',
    'src/app/admin/customers/page.tsx',
    'src/app/admin/insights/page.tsx',
    'src/app/admin/payments/page.tsx',
    'src/app/admin/pricing/page.tsx',
    'src/app/admin/reviews/page.tsx',
    'src/app/admin/sports/page.tsx',
    'src/app/admin/page.tsx'
]

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace the specific div
        new_content = content.replace('className="p-8"', 'className="p-4 md:p-8 overflow-x-hidden w-full"')
        
        if content != new_content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f'Updated {f}')
        else:
            print(f'No match in {f}')
    except Exception as e:
        print(f'Error reading {f}: {e}')
