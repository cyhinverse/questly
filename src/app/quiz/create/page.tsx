"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useQuiz } from "@/hooks/useQuiz";
import { useAuth } from "@/hooks/useAuth";
import { createQuizSchema, type CreateQuizFormData } from "@/lib/schemas";
import { useToast } from "@/hooks/useToast";
export default function CreateQuiz() {
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiTopic, setAiTopic] = useState("");
    const [aiQuestionCount, setAiQuestionCount] = useState(5);
    const [aiProgress, setAiProgress] = useState("");
    const { createQuiz, addQuestion, loading, setLoading, error } = useQuiz();
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const {
      register,
      handleSubmit,
      control,
      formState: { errors },
      setValue,
      watch,
    } = useForm<CreateQuizFormData>({
      resolver: zodResolver(createQuizSchema),
      defaultValues: {
        quiz: {
          title: "",
          description: "",
          difficulty: "medium",
        },
        questions: [
          {
            content: "",
            options: ["", "", "", ""],
            correct_answer: 0,
          },
        ],
      },
    });

    const { fields, append, remove } = useFieldArray({
      control,
      name: "questions",
    });
    const generateQuestionsWithAI = async () => {
      if (!aiTopic.trim()) {
        toast({
          title: "Warning",
          description: "Vui lòng nhập chủ đề để tạo câu hỏi AI",
          variant: "destructive",
        });
        return;
      }
      setAiGenerating(true);
      try {
        const randomDifficulty = ["easy", "medium", "hard"][Math.floor(Math.random() * 3)] as "easy" | "medium" | "hard";
        
        if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
          toast({
            title: "Error",
            description: 'API key không được tìm thấy. Vui lòng kiểm tra cấu hình.',
            variant: "destructive",
          });
          return;
        }

        // Cập nhật progress cho việc tạo câu hỏi theo batch
        const totalBatches = Math.ceil(aiQuestionCount / 10);
        const currentBatch = 0;
        
        const aiQuestions = await generateQuestionsWithMistral(aiTopic, aiQuestionCount, randomDifficulty);
        
        if (Array.isArray(aiQuestions) && aiQuestions.length > 0) {
          // Update form with AI generated questions
          setValue("questions", aiQuestions);
        } else {
          throw new Error('Failed to generate valid questions');
        }
        
        const currentTitle = watch("quiz.title");
        const currentDescription = watch("quiz.description");
        
        if (!currentTitle?.trim()) {
          setValue("quiz.title", `${aiTopic} Quiz`);
        }
        if (!currentDescription?.trim()) {
          setValue("quiz.description", `A quiz about ${aiTopic} with ${aiQuestionCount} questions`);
        }
        setValue("quiz.difficulty", randomDifficulty);
        
        toast({
          title: "Success",
          description: `Đã tạo thành công ${aiQuestions.length} câu hỏi về "${aiTopic}"`,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast({
          title: "Error",
          description: `Tạo câu hỏi AI thất bại: ${errorMessage}. Vui lòng thử lại hoặc tạo câu hỏi thủ công.`,
          variant: "destructive",
        });
      } finally {
        setAiGenerating(false);
      }
    };
    const generateQuestionsWithMistral = async (topic: string, count: number, difficulty: string) => {
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('API key không được tìm thấy');
      }

      // Tạo câu hỏi theo batch để tránh lỗi too many requests
      const BATCH_SIZE = 5; // Giảm batch size để tránh rate limit
      const batches = Math.ceil(count / BATCH_SIZE);
      const allQuestions = [];

      for (let i = 0; i < batches; i++) {
        const currentBatchSize = Math.min(BATCH_SIZE, count - (i * BATCH_SIZE));
        const batchNumber = i + 1;
        
        // Cập nhật progress
        setAiProgress(`Đang tạo batch ${batchNumber}/${batches} (${allQuestions.length}/${count} câu hỏi)...`);
        
        let retryCount = 0;
        const maxRetries = 3;
        let batchQuestions = null;
        
        while (retryCount < maxRetries && !batchQuestions) {
          try {
            batchQuestions = await generateBatchQuestions(
              apiKey, 
              topic, 
              currentBatchSize, 
              difficulty, 
              batchNumber, 
              batches
            );
            allQuestions.push(...batchQuestions);
            
            // Tăng delay theo batch number để tránh rate limit
            const delay = Math.min(2000 + (i * 500), 5000); // 2s, 2.5s, 3s, 3.5s, 4s, 4.5s, 5s max
            if (i < batches - 1) {
              setAiProgress(`Hoàn thành batch ${batchNumber}, chờ ${delay/1000}s trước batch tiếp theo...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          } catch (error) {
            retryCount++;
            
            // Xử lý lỗi rate limit với delay dài hơn
            const isRateLimit = error instanceof Error && error.message.includes('RATE_LIMIT_EXCEEDED');
            const isServerError = error instanceof Error && error.message.includes('SERVER_ERROR');
            
            if (retryCount < maxRetries) {
              let backoffDelay;
              
              if (isRateLimit) {
                // Rate limit: delay dài hơn (5s, 10s, 20s)
                backoffDelay = Math.pow(2, retryCount) * 5000;
                setAiProgress(`Rate limit! Chờ ${backoffDelay/1000}s trước khi thử lại... (${retryCount}/${maxRetries})`);
              } else if (isServerError) {
                // Server error: delay vừa (2s, 4s, 8s)
                backoffDelay = Math.pow(2, retryCount) * 2000;
                setAiProgress(`Lỗi server, thử lại sau ${backoffDelay/1000}s... (${retryCount}/${maxRetries})`);
              } else {
                // Lỗi khác: delay ngắn (1s, 2s, 4s)
                backoffDelay = Math.pow(2, retryCount) * 1000;
                setAiProgress(`Batch ${batchNumber} thất bại, thử lại sau ${backoffDelay/1000}s... (${retryCount}/${maxRetries})`);
              }
              
              await new Promise(resolve => setTimeout(resolve, backoffDelay));
            } else {
              // Nếu vẫn thất bại, thử với batch size nhỏ hơn
              if (currentBatchSize > 3) {
                setAiProgress(`Batch ${batchNumber} thất bại hoàn toàn, thử với batch nhỏ hơn...`);
                try {
                  const smallerBatch = await generateBatchQuestions(
                    apiKey, 
                    topic, 
                    3, 
                    difficulty, 
                    batchNumber, 
                    batches
                  );
                  allQuestions.push(...smallerBatch);
                } catch (smallerError) {
                  throw new Error(`Không thể tạo batch ${batchNumber} ngay cả với batch size nhỏ: ${smallerError}`);
                }
              } else {
                throw new Error(`Không thể tạo batch ${batchNumber} sau ${maxRetries} lần thử`);
              }
            }
          }
        }
      }

      return allQuestions.slice(0, count); // Đảm bảo không vượt quá số lượng yêu cầu
    };

    const generateBatchQuestions = async (
      apiKey: string, 
      topic: string, 
      batchSize: number, 
      difficulty: string, 
      batchNumber: number, 
      totalBatches: number
    ) => {
      const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Questly Quiz App',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-small-3.2-24b-instruct:free',
          messages: [
            {
              role: 'user',
              content: `Tạo ${batchSize} câu hỏi trắc nghiệm về "${topic}" với độ khó ${difficulty} (Batch ${batchNumber}/${totalBatches}). 
QUAN TRỌNG: Trả về CHỈ mảng JSON thuần, KHÔNG có markdown, KHÔNG có text khác.
Format:
[
  {
    "content": "Câu hỏi tự do về chủ đề",
    "options": ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3", "Lựa chọn 4"],
    "correct_answer": 0
  }
]
Yêu cầu:
- Mỗi câu hỏi phải có đúng 4 lựa chọn
- correct_answer phải là 0, 1, 2, hoặc 3
- Tạo câu hỏi đa dạng, tự nhiên, không theo format cố định
- Câu hỏi có thể là định nghĩa, so sánh, phân tích, ứng dụng, v.v.
- Lựa chọn phải đa dạng và thực tế
- Tất cả bằng tiếng Việt
- Mỗi câu hỏi phải khác nhau hoàn toàn
- KHÔNG sử dụng markdown code blocks
- KHÔNG có text giải thích
- CHỈ trả về JSON array
Tạo ${batchSize} câu hỏi ${difficulty} về ${topic}`
            }
          ],
          temperature: 0.7,
          max_tokens: 4000 // Tăng max_tokens cho batch
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Xử lý lỗi 429 (Too Many Requests) cụ thể
        if (response.status === 429) {
          throw new Error('RATE_LIMIT_EXCEEDED');
        }
        
        // Xử lý các lỗi khác
        if (response.status >= 500) {
          throw new Error('SERVER_ERROR');
        }
        
        throw new Error(`Yêu cầu thất bại: ${response.status}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Định dạng phản hồi không hợp lệ');
      }

      const generatedContent = data.choices[0].message.content;

      // Parse JSON response
      let questions;
      try {
        questions = JSON.parse(generatedContent);
      } catch (parseError) {
        
        // Clean và parse lại
        let cleaned = generatedContent.trim()
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .replace(/```/g, '')
          .replace(/^`+|`+$/g, '')
          .trim();
        
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          cleaned = jsonMatch[0].trim();
        }
        
        try {
          questions = JSON.parse(cleaned);
        } catch (secondError) {
          throw new Error('Không thể phân tích phản hồi JSON');
        }
      }

      // Validate questions format
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Định dạng câu hỏi không hợp lệ');
      }

      // Ensure each question has required fields
      const validatedQuestions = questions.map((q: any, index: number) => ({
        content: q.content || `Question ${index + 1}`,
        options: Array.isArray(q.options) && q.options.length === 4 
          ? q.options 
          : ['Lựa chọn 1', 'Lựa chọn 2', 'Lựa chọn 3', 'Lựa chọn 4'],
        correct_answer: typeof q.correct_answer === 'number' && q.correct_answer >= 0 && q.correct_answer <= 3
          ? q.correct_answer 
          : 0
      }));

      return validatedQuestions;
    };

    const onSubmit = async (data: CreateQuizFormData) => {
      if (!user) {
        toast({
          title: "Warning",
          description: "Vui lòng đăng nhập để tạo quiz",
          variant: "destructive",
        });
        return;
      }
      
      setLoading(true);
      
      try {
        const { data: quiz, error: quizError } = await createQuiz({
          title: data.quiz.title,
          description: data.quiz.description?.trim() || undefined,
          difficulty: data.quiz.difficulty,
          created_by: user.id,
        });
        
        if (quizError) {
          toast({
            title: "Error",
            description: `Tạo quiz thất bại: ${quizError}`,
            variant: "destructive",
          });
          return;
        }
        
        if (!quiz) {
          toast({
            title: "Error",
            description: 'Không thể tạo quiz',
            variant: "destructive",
          });
          return;
        }
        
        // Thêm các câu hỏi với error handling
        for (let i = 0; i < data.questions.length; i++) {
          const question = data.questions[i];
          
          if (question.content.trim() && question.options.every((opt: string) => opt.trim())) {
            const { error: questionError } = await addQuestion({
              quiz_id: quiz.id,
              content: question.content,
              options: question.options,
              correct_answer: question.correct_answer,
            });
            
            if (questionError) {
              toast({
                title: "Error",
                description: `Lỗi khi thêm câu hỏi ${i + 1}: ${questionError}`,
                variant: "destructive",
              });
              return;
            }
          }
        }
        
        toast({
          title: "Success",
          description: "Tạo quiz thành công!",
        });
        router.push("/quiz");
      } catch (error) {
        toast({
          title: "Error",
          description: `Lỗi khi thêm câu hỏi: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    const addQuestionField = () => {
      append({
        content: "",
        options: ["", "", "", ""],
        correct_answer: 0,
      });
    };
    
    const removeQuestion = (index: number) => {
      if (fields.length > 1) {
        remove(index);
      }
    };
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4 pt-24">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                <h1 className="text-4xl font-sans font-bold text-black mb-3 tracking-tight">Create New Quiz</h1>
                <p className="text-lg font-sans text-gray-700">Share your knowledge with everyone!</p>
              </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Quiz Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-black mb-3">Quiz Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter quiz title"
                  {...register("quiz.title")}
                  className={errors.quiz?.title ? "border-red-500" : ""}
                />
                {errors.quiz?.title && (
                  <p className="text-red-500 text-xs">{errors.quiz.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={watch("quiz.difficulty")}
                  onValueChange={(value) => setValue("quiz.difficulty", value as "easy" | "medium" | "hard")}
                >
                  <SelectTrigger className={errors.quiz?.difficulty ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                {errors.quiz?.difficulty && (
                  <p className="text-red-500 text-xs">{errors.quiz.difficulty.message}</p>
                )}
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your quiz"
                {...register("quiz.description")}
                className={errors.quiz?.description ? "border-red-500" : ""}
                rows={2}
              />
              {errors.quiz?.description && (
                <p className="text-red-500 text-xs">{errors.quiz.description.message}</p>
              )}
            </div>
          </div>
          {/* AI Question Generation */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-black mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Tạo Câu Hỏi Tự Động
            </h3>
            <p className="text-blue-600 text-sm mb-4">
              Tạo câu hỏi trắc nghiệm bằng AI
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="space-y-2">
                <Label htmlFor="aiTopic">Chủ đề</Label>
                <Input
                  id="aiTopic"
                  placeholder="VD: Lịch sử Việt Nam, Toán học, Văn học"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aiQuestionCount">Số câu hỏi</Label>
                <Input
                  id="aiQuestionCount"
                  type="number"
                  value={aiQuestionCount.toString()}
                  onChange={(e) => setAiQuestionCount(parseInt(e.target.value) || 5)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={generateQuestionsWithAI}
                  disabled={aiGenerating || !aiTopic.trim()}
                  className="w-full"
                >
                  {aiGenerating ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Questions
                    </>
                  )}
                </Button>
              </div>
            </div>
            {aiGenerating && (
              <div className="text-blue-600 text-sm">
                {aiProgress || `AI đang tạo ${aiQuestionCount} câu hỏi về "${aiTopic}"...`}
              </div>
            )}
          </div>
          {/* Questions */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-black">Questions ({fields.length})</h3>
              <Button 
                type="button" 
                onClick={addQuestionField}
                variant="outline"
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Question
              </Button>
            </div>
            {fields.map((field, qIndex) => (
              <div key={qIndex} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-lg text-black">Question {qIndex + 1}</h4>
                  {fields.length > 1 && (
                    <Button 
                      type="button" 
                      onClick={() => removeQuestion(qIndex)}
                      variant="destructive"
                      size="sm"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div className="mb-6 space-y-2">
                  <Label htmlFor={`question-${qIndex}`}>Question</Label>
                  <Input
                    id={`question-${qIndex}`}
                    placeholder="Enter your question..."
                    {...register(`questions.${qIndex}.content`)}
                    className={errors.questions?.[qIndex]?.content ? "border-red-500" : ""}
                  />
                  {errors.questions?.[qIndex]?.content && (
                    <p className="text-red-500 text-xs">{errors.questions[qIndex]?.content?.message}</p>
                  )}
                </div>
                <div className="space-y-4">
                  <Label className="block text-sm font-medium text-black mb-3">
                    Answer Options (select correct one)
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    {[0, 1, 2, 3].map((oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-lg hover:border-purple-300 transition-colors">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={watch(`questions.${qIndex}.correct_answer`) === oIndex}
                          onChange={() => setValue(`questions.${qIndex}.correct_answer`, oIndex)}
                          className="text-purple-600 focus:ring-purple-500 flex-shrink-0"
                        />
                        <Input
                          id={`option-${qIndex}-${oIndex}`}
                          placeholder={`Option ${oIndex + 1}`}
                          {...register(`questions.${qIndex}.options.${oIndex}`)}
                          className={`flex-1 ${errors.questions?.[qIndex]?.options?.[oIndex] ? "border-red-500" : ""}`}
                        />
                      </div>
                    ))}
                  </div>
                  {errors.questions?.[qIndex]?.options && (
                    <p className="text-red-500 text-xs mt-1">{errors.questions[qIndex]?.options?.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-gray-200">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <LoadingSpinner size="sm" />
                  <span className="animate-pulse">Creating Quiz...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Quiz
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</ProtectedRoute>
  );
}
