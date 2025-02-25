from utils import get_pipeline, read_input, write_output

MODEL_NAME = "distilbert-base-uncased"

def analyze_priority_factors(text: str) -> dict[str, float]:
    """テキストから優先度に関する各要素を分析します"""
    classifier = get_pipeline(
        "text-classification",
        MODEL_NAME,
        max_length=512
    )
    
    factors = {
        "urgency": "Does this task have a deadline or time constraint?",
        "importance": "Is this task important for the project or business?",
        "dependency": "Do other tasks depend on this task?",
        "effort": "Does this task require significant effort or resources?"
    }
    
    results = {}
    for factor, question in factors.items():
        result = classifier(f"{question} {text}")
        results[factor] = result[0]["score"]
    
    return results

def determine_priority(factors: dict[str, float]) -> str:
    """各要素のスコアから優先度を決定します"""
    # 重み付け
    weights = {
        "urgency": 0.4,
        "importance": 0.3,
        "dependency": 0.2,
        "effort": 0.1
    }
    
    # 加重平均の計算
    weighted_score = sum(
        factors[factor] * weight
        for factor, weight in weights.items()
    )
    
    # スコアに基づいて優先度を決定
    if weighted_score > 0.7:
        return "高"
    elif weighted_score > 0.4:
        return "中"
    else:
        return "低"

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
        
        # 各要素の分析
        factors = analyze_priority_factors(full_text)
        
        # 優先度の決定
        priority = determine_priority(factors)
        
        write_output({
            "priority": priority
        })
    except Exception as e:
        write_output({"error": f"Failed to analyze priority: {str(e)}"})

if __name__ == "__main__":
    main() 