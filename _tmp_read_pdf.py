from pypdf import PdfReader
p = PdfReader(r"c:\ESDM-Virtual-Lab\pdfs\format.pdf")
print("pages", len(p.pages))
for i, page in enumerate(p.pages, start=1):
    t = (page.extract_text() or "").strip()
    print(f"---PAGE {i}---")
    print(t[:3500])
