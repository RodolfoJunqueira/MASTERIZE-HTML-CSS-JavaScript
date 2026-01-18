// Banco de dados simulado de exercícios
const exercisesDatabase = [
  {
    id: 1,
    title: "Equação do 2º Grau",
    subject: "matematica",
    description: "Resolva a equação do 2º grau: x² - 5x + 6 = 0",
    answer: "x = 2 ou x = 3",
    explanation: "Para resolver esta equação, podemos fatorar o polinômio x² - 5x + 6 = 0.\nIdentificamos que x² - 5x + 6 = (x - 2)(x - 3) = 0.\nPortanto, x - 2 = 0 ou x - 3 = 0, o que nos dá x = 2 ou x = 3."
  },
  {
    id: 2,
    title: "Análise Sintática",
    subject: "portugues",
    description: "Identifique o sujeito da frase: 'Os alunos estudaram para a prova.'",
    answer: "Os alunos",
    explanation: "Na frase 'Os alunos estudaram para a prova', o sujeito é 'Os alunos' porque é quem pratica a ação de estudar. O verbo é 'estudaram' e 'para a prova' é o complemento verbal."
  },
  {
    id: 3,
    title: "Sistema Solar",
    subject: "ciencias",
    description: "Quais são os planetas do Sistema Solar em ordem de proximidade com o Sol?",
    answer: "Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano, Netuno",
    explanation: "Os planetas do Sistema Solar em ordem de proximidade com o Sol são: Mercúrio (o mais próximo), Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno (o mais distante)."
  },
  {
    id: 4,
    title: "Cálculo de Porcentagem",
    subject: "matematica",
    description: "Calcule 25% de 80.",
    answer: "20",
    explanation: "Para calcular 25% de 80, podemos usar a fórmula: valor = (porcentagem/100) × número\nValor = (25/100) × 80\nValor = 0,25 × 80\nValor = 20"
  },
  {
    id: 5,
    title: "Concordância Verbal",
    subject: "portugues",
    description: "Complete a frase com a forma verbal correta: 'A maioria dos alunos _____ (passar/passaram) na prova.'",
    answer: "passou",
    explanation: "Quando o sujeito é 'a maioria de', o verbo pode concordar com o núcleo do sujeito (maioria) ou com o especificador (alunos). No entanto, a concordância com o núcleo é mais aceita na norma culta, portanto 'passou' é a forma correta."
  },
  {
    id: 6,
    title: "Cadeia Alimentar",
    subject: "ciencias",
    description: "Explique o que aconteceria em uma cadeia alimentar se todos os produtores fossem eliminados.",
    answer: "Toda a cadeia alimentar entraria em colapso, pois os produtores são a base da cadeia e fornecem energia para todos os outros níveis tróficos.",
    explanation: "Os produtores (plantas e algas) são organismos que produzem seu próprio alimento através da fotossíntese. Eles são a base da cadeia alimentar e fornecem energia para os consumidores primários, que por sua vez alimentam os consumidores secundários e assim por diante. Se os produtores fossem eliminados, não haveria fonte de energia para os consumidores primários, causando sua extinção, o que afetaria todos os níveis tróficos superiores, levando ao colapso de toda a cadeia alimentar."
  }
];

// Banco de dados simulado de usuários
const usersDatabase = {
  students: [
    { id: 1, name: "João Silva", email: "joao@email.com", password: "senha123", progress: [] }
  ],
  teachers: [
    { id: 1, name: "Profa. Ana", email: "ana@email.com", password: "prof123" }
  ]
};

// Usuário atual (simulação de login)
let currentUser = null;
let currentMode = 'student'; // 'student' ou 'teacher'

// Funções para manipulação do DOM
document.addEventListener('DOMContentLoaded', () => {
  // Carregar exercícios na página inicial
  loadExercises('todos');
  
  // Adicionar event listeners
  setupEventListeners();
  
  // Verificar se há usuário logado no localStorage
  checkLoggedUser();
  
  // Configurar formulários de login
  setupLoginForms();
});

// Configurar todos os event listeners
function setupEventListeners() {
  // Filtros de matérias
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const subject = button.getAttribute('data-subject');
      
      // Atualizar classe ativa
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Carregar exercícios filtrados
      loadExercises(subject);
    });
  });
  
  // Modal de exercício
  const modal = document.getElementById('exercise-modal');
  const closeModal = document.querySelector('.close-modal');
  
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
  
  // Fechar modal ao clicar fora
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Botão de enviar resposta
  const submitButton = document.getElementById('submit-answer');
  if (submitButton) {
    submitButton.addEventListener('click', checkAnswer);
  }
  
  // Botão de ajuda
  const helpButton = document.getElementById('request-help');
  if (helpButton) {
    helpButton.addEventListener('click', showAIHelp);
  }
  
  // Chat com IA
  const sendButton = document.getElementById('send-btn');
  const userInput = document.getElementById('user-input');
  
  if (sendButton && userInput) {
    sendButton.addEventListener('click', () => sendMessageToAI());
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessageToAI();
      }
    });
  }
}

// Carregar exercícios na grade
function loadExercises(subject) {
  const exercisesGrid = document.querySelector('.exercises-grid');
  if (!exercisesGrid) return;
  
  // Limpar grid atual
  exercisesGrid.innerHTML = '';
  
  // Filtrar exercícios por matéria
  const filteredExercises = subject === 'todos' 
    ? exercisesDatabase 
    : exercisesDatabase.filter(ex => ex.subject === subject);
  
  // Verificar se há exercícios
  if (filteredExercises.length === 0) {
    exercisesGrid.innerHTML = '<p>Nenhum exercício encontrado para esta matéria.</p>';
    return;
  }
  
  // Criar cards de exercícios
  filteredExercises.forEach(exercise => {
    const exerciseCard = document.createElement('div');
    exerciseCard.className = 'exercise-card';
    exerciseCard.innerHTML = `
      <h3>${exercise.title}</h3>
      <p>Matéria: ${getSubjectName(exercise.subject)}</p>
      <button class="btn-primary open-exercise" data-id="${exercise.id}">Praticar</button>
    `;
    exercisesGrid.appendChild(exerciseCard);
    
    // Adicionar event listener ao botão
    const openButton = exerciseCard.querySelector('.open-exercise');
    openButton.addEventListener('click', () => openExercise(exercise.id));
  });
}

// Obter nome da matéria formatado
function getSubjectName(subject) {
  const subjects = {
    'matematica': 'Matemática',
    'portugues': 'Português',
    'ciencias': 'Ciências'
  };
  return subjects[subject] || subject;
}

// Abrir modal de exercício
function openExercise(exerciseId) {
  const exercise = exercisesDatabase.find(ex => ex.id === exerciseId);
  if (!exercise) return;
  
  // Preencher modal com dados do exercício
  document.getElementById('exercise-title').textContent = exercise.title;
  document.getElementById('exercise-description').textContent = exercise.description;
  
  // Limpar campos
  document.getElementById('user-answer').value = '';
  document.getElementById('answer-feedback').classList.add('hidden');
  document.getElementById('ai-help').classList.add('hidden');
  
  // Mostrar modal
  document.getElementById('exercise-modal').style.display = 'block';
  
  // Salvar ID do exercício atual
  document.getElementById('exercise-modal').setAttribute('data-exercise-id', exerciseId);
}

// Verificar resposta do usuário
function checkAnswer() {
  const exerciseId = parseInt(document.getElementById('exercise-modal').getAttribute('data-exercise-id'));
  const exercise = exercisesDatabase.find(ex => ex.id === exerciseId);
  
  if (!exercise) return;
  
  const userAnswer = document.getElementById('user-answer').value.trim();
  const feedbackDiv = document.getElementById('answer-feedback');
  const feedbackContent = document.getElementById('feedback-content');
  
  // Verificar se a resposta está vazia
  if (!userAnswer) {
    feedbackContent.innerHTML = '<p class="error">Por favor, digite sua resposta antes de enviar.</p>';
    feedbackDiv.classList.remove('hidden');
    return;
  }
  
  // Comparar resposta (simplificado - em um sistema real seria mais sofisticado)
  const isCorrect = userAnswer.toLowerCase() === exercise.answer.toLowerCase();
  
  // Exibir feedback
  if (isCorrect) {
    feedbackContent.innerHTML = '<p class="success">Parabéns! Sua resposta está correta!</p>';
  } else {
    feedbackContent.innerHTML = '<p class="error">Sua resposta não está correta. Tente novamente ou peça ajuda.</p>';
  }
  
  feedbackDiv.classList.remove('hidden');
  
  // Registrar progresso do aluno
  if (currentUser) {
    updateStudentProgress(exerciseId, isCorrect);
  }
}

// Mostrar ajuda da IA
function showAIHelp() {
  const aiHelp = document.getElementById('ai-help');
  aiHelp.classList.remove('hidden');
  
  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML = '';
  
  // Mensagem inicial da IA
  const aiMessage = document.createElement('p');
  aiMessage.className = 'ai-msg';
  aiMessage.textContent = "Olá! Em que posso ajudar com este exercício?";
  chatBox.appendChild(aiMessage);
  
  // Rolar para o final do chat
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Enviar mensagem para a IA
async function sendMessageToAI() {
  const userInput = document.getElementById('user-input');
  const message = userInput.value.trim();
  
  if (!message) return;
  
  const chatBox = document.getElementById('chat-box');
  
  // Adicionar mensagem do usuário ao chat
  const userMessage = document.createElement('p');
  userMessage.className = 'user-msg';
  userMessage.textContent = message;
  chatBox.appendChild(userMessage);
  
  // Limpar input
  userInput.value = '';
  
  // Obter exercício atual
  const exerciseId = parseInt(document.getElementById('exercise-modal').getAttribute('data-exercise-id'));
  const exercise = exercisesDatabase.find(ex => ex.id === exerciseId);
  
  // Simular resposta da IA (em um sistema real, usaria a API da OpenAI)
  let aiResponse = "Estou processando sua pergunta...";
  
  // Simular análise da pergunta
  if (message.toLowerCase().includes('como') || message.toLowerCase().includes('resolver')) {
    aiResponse = `Para resolver este exercício, você pode seguir estes passos:\n\n${exercise.explanation}`;
  } else if (message.toLowerCase().includes('dica')) {
    aiResponse = "Aqui vai uma dica: tente aplicar os conceitos que você aprendeu recentemente. Observe atentamente o enunciado e identifique as informações principais.";
  } else {
    aiResponse = "Posso ajudar a entender melhor o exercício. Tente me fazer uma pergunta específica sobre o que está tendo dificuldade.";
  }
  
  // Adicionar resposta da IA ao chat (com pequeno delay para simular processamento)
  setTimeout(() => {
    const aiMessage = document.createElement('p');
    aiMessage.className = 'ai-msg';
    aiMessage.textContent = aiResponse;
    chatBox.appendChild(aiMessage);
    
    // Rolar para o final do chat
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 1000);
}

// Atualizar progresso do aluno
function updateStudentProgress(exerciseId, isCorrect) {
  if (!currentUser) return;
  
  // Verificar se o exercício já existe no progresso
  const existingProgress = currentUser.progress.find(p => p.exerciseId === exerciseId);
  
  if (existingProgress) {
    // Atualizar tentativas e status
    existingProgress.attempts += 1;
    if (isCorrect) {
      existingProgress.completed = true;
    }
  } else {
    // Adicionar novo registro de progresso
    currentUser.progress.push({
      exerciseId,
      attempts: 1,
      completed: isCorrect,
      lastAttempt: new Date()
    });
  }
  
  // Em um sistema real, salvaria no banco de dados
  console.log('Progresso atualizado:', currentUser.progress);
}

// Simular login de estudante para demonstração
function simulateStudentLogin() {
  currentUser = {...usersDatabase.students[0]};
  console.log('Usuário logado:', currentUser.name);
}

// Função para obter resposta da IA (mantida para compatibilidade)
async function getAIResponse(message) {
  try {
    const API_KEY = 'SUA_CHAVE_OPENAI';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{role: "user", content: message}]
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error(err);
    return "Erro ao obter resposta da IA.";
  }
}
