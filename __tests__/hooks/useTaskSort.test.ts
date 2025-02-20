import { renderHook } from "@testing-library/react";

import { useTaskSort } from "@/hooks/useTaskSort";
import { useTaskStore } from "@/store/taskStore";

jest.mock("@/store/taskStore");

const mockUseTaskStore = useTaskStore as jest.MockedFunction<
  typeof useTaskStore
>;
const mockSetSortBy = jest.fn();

describe("useTaskSort", () => {
  beforeEach(() => {
    mockUseTaskStore.mockReturnValue({
      setSortBy: mockSetSortBy,
    } as ReturnType<typeof useTaskStore>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("ソートモードの名前を正しく返すこと", () => {
    const { result } = renderHook(() => useTaskSort());

    expect(result.current.getSortModeName("custom")).toBe("カスタム");
    expect(result.current.getSortModeName("priority")).toBe("優先度");
    expect(result.current.getSortModeName("createdAt")).toBe("作成日");
    expect(result.current.getSortModeName("dueDate")).toBe("期限日");
  });

  it("ソートモードを変更できること", () => {
    const { result } = renderHook(() => useTaskSort());
    const handleSortChange = result.current.handleSortChange("box");

    handleSortChange("priority");
    expect(mockSetSortBy).toHaveBeenCalledWith("box", "priority");

    handleSortChange("createdAt");
    expect(mockSetSortBy).toHaveBeenCalledWith("box", "createdAt");
  });

  it("ソートモードをリセットできること", () => {
    const { result } = renderHook(() => useTaskSort());
    const handleReset = result.current.handleReset("box");

    handleReset();
    expect(mockSetSortBy).toHaveBeenCalledWith("box", "custom");
  });

  it("異なるカテゴリーでソートモードを変更できること", () => {
    const { result } = renderHook(() => useTaskSort());

    result.current.handleSortChange("now")("priority");
    expect(mockSetSortBy).toHaveBeenCalledWith("now", "priority");

    result.current.handleSortChange("next")("dueDate");
    expect(mockSetSortBy).toHaveBeenCalledWith("next", "dueDate");
  });
});
