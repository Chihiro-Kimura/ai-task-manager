from utils import get_pipeline, read_input, write_output

MODEL_NAME = "distilbert-base-uncased"

def analyze_urgency(text: str) -> float:
    """テキストの緊急度を分析します"""
    classifier = get_pipeline(
        "text-classification",
        MODEL_NAME,
        max_length=512
    )
    result = classifier(
        f"Is this task urgent? {text}"
    )
    return result[0]["score"]

def analyze_importance(text: str) -> float:
    """テキストの重要度を分析します"""
    classifier = get_pipeline(
        "text-classification",
        MODEL_NAME,
        max_length=512
    )
    result = classifier(
        f"Is this task important? {text}"
    )
    return result[0]["score"]

def determine_category(urgency: float, importance: float) -> tuple[str, float]:
    """緊急度と重要度からカテゴリを決定します"""
    if urgency > 0.7:
        return "今すぐ", urgency
    elif importance > 0.7:
        return "次に", importance
    else:
        return "いつか", max(1 - urgency, 1 - importance)

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
        # タイトルと内容を結合
        full_text = f"{title}\n{content}"
        
        # 緊急度と重要度の分析
        urgency = analyze_urgency(full_text)
        importance = analyze_importance(full_text)
        
        # カテゴリの決定
        category, confidence = determine_category(urgency, importance)
        
        write_output({
            "category": category,
            "confidence": round(confidence, 2)
        })
    except Exception as e:
        write_output({"error": f"Failed to classify task: {str(e)}"})

if __name__ == "__main__":
    main() 