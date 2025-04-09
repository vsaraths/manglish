# 🌍 Manglish Translator

**Manglish Translator** is an open-source tool that converts **Malayalam written in English script (Manglish)** into its corresponding **English meaning** — not just transliteration, but actual contextual translation.

> 🧠 Example:  
> `"ningal evideya pokunnathu"` → `"Where are you going?"`

---

## 🔎 What Is Manglish?

**Manglish** is a common way for Malayalam speakers to communicate using the English alphabet. While easy for humans, it's challenging for machines to understand or translate.

This project bridges that gap by translating Manglish directly to proper English sentences — enabling communication, chatbot training, data analysis, and more.

---

## 💡 What This Project Does

- 🗣️ Translates conversational Manglish to natural English  
- 📁 Uses a growing dataset of Manglish-English pairs  
- 🔧 Easy to extend and integrate into your projects  
- 🧪 (Planned) Support for basic NLP models to auto-translate new inputs

---

## ✨ Example

```python
from manglish_translator import translate

print(translate("ningal evideya pokunnathu"))
# Output: "Where are you going?"

🔧 Installation
git clone https://github.com/yourusername/manglish-translator.git
cd manglish-translator
pip install -r requirements.txt

🤝 Contribute
We’re building a community-driven translation tool.
Feel free to:

Add more Manglish-English sentence pairs to the dataset

Improve the core logic

Suggest features via issues or pull requests

📂 Folder Structure
artham/
├── attached_assets/                     # Assets such as icons, images, and exports
│   └── artham-dictionary-export-2025-04-09.xlsx
│
├── client/                              # Frontend UI components
│   └── theme.json                       # Theme settings (white & green minimal theme)
│
├── server/                              # Backend services and API logic
│   └── import-phrases.ts
│   └── dictionary-enrichment.ts
│
├── shared/                              # Shared logic between client/server
│   └── db-push.ts
│
├── dictionary/                          # Dictionary and phrase handling logic
│   ├── add-dictionary-entries.ts
│   ├── add-more-dictionary-entries.ts
│   ├── add-phrase-patterns.ts
│   ├── import-excel-dictionary.ts
│   ├── export-dictionary.ts
│   ├── create-sample-excel.ts
│   ├── dictionary-template.xlsx
│
├── .gitignore                           # Git ignore rules
├── .replit                              # Replit configuration
├── drizzle.config.ts                    # Database config (Drizzle ORM)
├── postcss.config.js                    # PostCSS setup
├── tailwind.config.ts                   # Tailwind CSS config
├── tsconfig.json                        # TypeScript config
├── vite.config.ts                       # Vite build configuration
├── package.json                         # Project metadata and dependencies
├── package-lock.json                    # Dependency lock file
├── README.md                            # Project overview and setup instructions
└── generated-icon.png                   # App icon/logo


📜 License
MIT License. Open to everyone.

🙋‍♂️ Author
Made with ❤️ by Sarath V

Let’s make Manglish accessible to all!

