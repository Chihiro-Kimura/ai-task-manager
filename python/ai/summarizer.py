from typing import List

from utils import get_pipeline, read_input, write_output

MODEL_NAME = "sshleifer/distilbart-cnn-12-6"
MAX_LENGTH = 128
MIN_LENGTH = 30

def extract_keywords(text: str) -> List[str]:
    """テキストから重要なキーワードを抽出します"""
    # キーワード抽出用のパイプライン
    classifier = get_pipeline(
        "text-classification",
        "distilbert-base-uncased",
        max_length=512
    )
    
    # 文を単語に分割し、重要度を計算
    words = text.split()
    scores = []
    for word in words:
        if len(word) < 2:  # 短すぎる単語は除外
            continue
        result = classifier(f"Is '{word}' important in this context: {text}")
        scores.append((word, result[0]["score"]))
    
    # スコアの高い順にソートし、上位5つを返す
    keywords = sorted(scores, key=lambda x: x[1], reverse=True)[:5]
    return [word for word, _ in keywords]

def main() -> None:
    # 入力データの読み取り
    data = read_input()
    if "error" in data:
        write_output(data)
        return

    title = data.get("title", "")
    content = data.get("content", "")
    if not title or not content:
        write_output({"error": "Title and content are required"})
        return

    try:
        # 要約の生成
        summarizer = get_pipeline(
            "summarization",
            MODEL_NAME,
            max_length=MAX_LENGTH,
            min_length=MIN_LENGTH,
            do_sample=False
        )
        
        # タイトルと内容を結合して要約
        full_text = f"{title}\n{content}"
        summary = summarizer(full_text)[0]["summary_text"]
        
        # キーワードの抽出
        keywords = extract_keywords(full_text)
        
        write_output({
            "summary": summary,
            "keywords": keywords
        })
    except Exception as e:
        write_output({"error": f"Failed to generate summary: {str(e)}"})

if __name__ == "__main__":
    main() 