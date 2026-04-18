path = r"D:\Haider\Rabi zidni ilma\githubCopilotCli\typing-tutor\src\data\blogPosts.js"
content = """export const BLOG_POSTS = [
  {
    slug: 'test',
    content: `hello world`,
  },
]"""
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("ok", content.count("\n"), "lines")
