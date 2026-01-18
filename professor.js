/**
 * MASTERIZE - Funcionalidades específicas para a área do professor
 */

// Verificar se o usuário está logado como professor
function checkTeacherLogin() {
  const savedUser = localStorage.getItem('currentUser');
  const savedMode = localStorage.getItem('currentMode');
  
  if (!savedUser || savedMode !== 'teacher') {
    // Redirecionar para página de login
    alert('Você precisa estar logado como professor para acessar esta página.');
    window.location.href = 'index.html';
  } else {
    // Atualizar nome do professor
    const user = JSON.parse(savedUser);
    document.getElementById('user-name').textContent = user.name;
  }
}

// Configurar tabs
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      
      // Atualizar classe ativa nos botões
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Mostrar conteúdo da tab selecionada
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Carregar dados do dashboard
function loadDashboardData() {
  // Carregar dados do localStorage
  const exercisesDatabase = JSON.parse(localStorage.getItem('exercisesDatabase')) || [];
  const usersDatabase = JSON.parse(localStorage.getItem('usersDatabase')) || { students: [] };
  
  // Atualizar contadores
  document.getElementById('total-exercicios').textContent = exercisesDatabase.length;
  document.getElementById('total-alunos').textContent = usersDatabase.students.length;
  
  // Calcular taxa de conclusão
  let completedCount = 0;
  let totalCount = 0;
  
  usersDatabase.students.forEach(student => {
    if (student.progress) {
      student.progress.forEach(p => {
        totalCount++;
        if (p.completed) completedCount++;
      });
    }
  });
  
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  document.getElementById('taxa-conclusao').textContent = completionRate + '%';
  
  // Carregar atividades recentes
  loadRecentActivities();
}

// Carregar atividades recentes
function loadRecentActivities() {
  const recentActivityList = document.getElementById('recent-activity-list');
  const activities = JSON.parse(localStorage.getItem('recentActivities')) || [];
  
  if (activities.length === 0) {
    recentActivityList.innerHTML = '<li>Nenhuma atividade recente</li>';
    return;
  }
  
  recentActivityList.innerHTML = '';
  
  // Mostrar as 5 atividades mais recentes
  activities.slice(0, 5).forEach(activity => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${activity.user}</strong>: ${activity.action} - ${formatDate(activity.date)}`;
    recentActivityList.appendChild(li);
  });
}

// Formatar data
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
}

// Carregar lista de exercícios
function loadExercisesList() {
  const exercisesDatabase = JSON.parse(localStorage.getItem('exercisesDatabase')) || [];
  const exercisesList = document.getElementById('exercises-list');
  const filterSubject = document.getElementById('filter-subject').value;
  
  if (exercisesDatabase.length === 0) {
    exercisesList.innerHTML = '<tr><td colspan="4">Nenhum exercício cadastrado</td></tr>';
    return;
  }
  
  exercisesList.innerHTML = '';
  
  // Filtrar por matéria se necessário
  const filteredExercises = filterSubject === 'todos' 
    ? exercisesDatabase 
    : exercisesDatabase.filter(ex => ex.subject === filterSubject);
  
  if (filteredExercises.length === 0) {
    exercisesList.innerHTML = '<tr><td colspan="4">Nenhum exercício encontrado para esta matéria</td></tr>';
    return;
  }
  
  filteredExercises.forEach(exercise => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${exercise.id}</td>
      <td>${exercise.title}</td>
      <td>${getSubjectName(exercise.subject)}</td>
      <td>
        <button class="btn-small edit-exercise" data-id="${exercise.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-small delete-exercise" data-id="${exercise.id}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    exercisesList.appendChild(row);
  });
  
  // Adicionar event listeners para botões de editar e excluir
  setupExerciseActions();
}

// Configurar ações para exercícios
function setupExerciseActions() {
  // Botões de editar
  document.querySelectorAll('.edit-exercise').forEach(button => {
    button.addEventListener('click', () => {
      const exerciseId = button.getAttribute('data-id');
      editExercise(exerciseId);
    });
  });
  
  // Botões de excluir
  document.querySelectorAll('.delete-exercise').forEach(button => {
    button.addEventListener('click', () => {
      const exerciseId = button.getAttribute('data-id');
      deleteExercise(exerciseId);
    });
  });
}

// Editar exercício
function editExercise(exerciseId) {
  const exercisesDatabase = JSON.parse(localStorage.getItem('exercisesDatabase')) || [];
  const exercise = exercisesDatabase.find(ex => ex.id == exerciseId);
  
  if (!exercise) {
    alert('Exercício não encontrado!');
    return;
  }
  
  // Preencher formulário com dados do exercício
  document.getElementById('exercise-title-input').value = exercise.title;
  document.getElementById('exercise-subject').value = exercise.subject;
  document.getElementById('exercise-description-input').value = exercise.description;
  document.getElementById('exercise-answer').value = exercise.answer;
  document.getElementById('exercise-explanation').value = exercise.explanation;
  
  // Modificar formulário para modo de edição
  const form = document.getElementById('new-exercise-form');
  form.setAttribute('data-edit-id', exerciseId);
  document.querySelector('#new-exercise-form button[type="submit"]').textContent = 'Atualizar Exercício';
  
  // Abrir modal
  document.getElementById('new-exercise-modal').style.display = 'block';
}

// Excluir exercício
function deleteExercise(exerciseId) {
  if (!confirm('Tem certeza que deseja excluir este exercício?')) {
    return;
  }
  
  const exercisesDatabase = JSON.parse(localStorage.getItem('exercisesDatabase')) || [];
  const updatedExercises = exercisesDatabase.filter(ex => ex.id != exerciseId);
  
  localStorage.setItem('exercisesDatabase', JSON.stringify(updatedExercises));
  
  // Registrar atividade
  addActivity('Exercício excluído');
  
  // Recarregar lista
  loadExercisesList();
  
  // Atualizar dashboard
  loadDashboardData();
  
  alert('Exercício excluído com sucesso!');
}

// Carregar lista de alunos
function loadStudentsList() {
  const usersDatabase = JSON.parse(localStorage.getItem('usersDatabase')) || { students: [] };
  const studentList = document.getElementById('student-list');
  
  if (usersDatabase.students.length === 0) {
    studentList.innerHTML = '<p>Nenhum aluno cadastrado</p>';
    return;
  }
  
  studentList.innerHTML = '';
  
  usersDatabase.students.forEach(student => {
    const studentCard = document.createElement('div');
    studentCard.className = 'student-card';
    
    // Calcular estatísticas
    const exercisesDatabase = JSON.parse(localStorage.getItem('exercisesDatabase')) || [];
    const totalExercises = exercisesDatabase.length;
    const completedExercises = student.progress ? student.progress.filter(p => p.completed).length : 0;
    const completionRate = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
    
    studentCard.innerHTML = `
      <h3>${student.name}</h3>
      <p>Email: ${student.email}</p>
      <div class="progress-bar">
        <div class="progress" style="width: ${completionRate}%"></div>
        <span>${completionRate}% concluído</span>
      </div>
      <p>Exercícios concluídos: ${completedExercises}/${totalExercises}</p>
    `;
    
    studentList.appendChild(studentCard);
  });
}

// Configurar modal de novo exercício
function setupNewExerciseModal() {
  const modal = document.getElementById('new-exercise-modal');
  const addButton = document.getElementById('add-exercise-btn');
  const closeButton = modal.querySelector('.close-modal');
  const form = document.getElementById('new-exercise-form');
  
  // Abrir modal
  addButton.addEventListener('click', () => {
    // Resetar formulário para modo de adição
    form.reset();
    form.removeAttribute('data-edit-id');
    document.querySelector('#new-exercise-form button[type="submit"]').textContent = 'Adicionar Exercício';
    modal.style.display = 'block';
  });
  
  // Fechar modal
  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Fechar ao clicar fora
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Enviar formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const editId = form.getAttribute('data-edit-id');
    if (editId) {
      updateExercise(editId);
    } else {
      addNewExercise();
    }
  });
}

// Adicionar novo exercício
function addNewExercise() {
  const title = document.getElementById('exercise-title-input').value.trim();
  const subject = document.getElementById('exercise-subject').value;
  const description = document.getElementById('exercise-description-input').value.trim();
  const answer = document.getElementById('exercise-answer').value.trim();
  const explanation = document.getElementById('exercise-explanation').value.trim();
  
  if (!title || !description || !answer || !explanation) {
    alert('Por favor, preencha todos os campos.');
    return;
  }
  
  // Carregar exercícios existentes
  const exercisesDatabase = JSON.parse(localStorage.getItem('exercisesDatabase')) || [];
  
  // Criar novo exercício
  const newExercise = {
    id: exercisesDatabase.length + 1,
    title,
    subject,
    description,
    answer,
    explanation
  };
  
  // Adicionar ao banco de dados
  exercisesDatabase.push(newExercise);
  
  // Salvar no localStorage
  localStorage.setItem('exercisesDatabase', JSON.stringify(exercisesDatabase));
  
  // Registrar atividade
  addActivity('Novo exercício adicionado');
  
  // Limpar formulário
  document.getElementById('new-exercise-form').reset();
  
  // Fechar modal
  document.getElementById('new-exercise-modal').style.display = 'none';
  
  // Recarregar lista de exercícios
  loadExercisesList();
  
  // Atualizar dashboard
  loadDashboardData();
  
  alert('Exercício adicionado com sucesso!');
}

// Atualizar exercício existente
function updateExercise(exerciseId) {
  const title = document.getElementById('exercise-title-input').value.trim();
  const subject = document.getElementById('exercise-subject').value;
  const description = document.getElementById('exercise-description-input').value.trim();
  const answer = document.getElementById('exercise-answer').value.trim();
  const explanation = document.getElementById('exercise-explanation').value.trim();
  
  if (!title || !description || !answer || !explanation) {
    alert('Por favor, preencha todos os campos.');
    return;
  }
  
  // Carregar exercícios existentes
  const exercisesDatabase = JSON.parse(localStorage.getItem('exercisesDatabase')) || [];
  
  // Encontrar índice do exercício
  const index = exercisesDatabase.findIndex(ex => ex.id == exerciseId);
  
  if (index === -1) {
    alert('Exercício não encontrado!');
    return;
  }
  
  // Atualizar exercício
  exercisesDatabase[index] = {
    ...exercisesDatabase[index],
    title,
    subject,
    description,
    answer,
    explanation
  };
  
  // Salvar no localStorage
  localStorage.setItem('exercisesDatabase', JSON.stringify(exercisesDatabase));
  
  // Registrar atividade
  addActivity('Exercício atualizado');
  
  // Limpar formulário
  document.getElementById('new-exercise-form').reset();
  document.getElementById('new-exercise-form').removeAttribute('data-edit-id');
  
  // Fechar modal
  document.getElementById('new-exercise-modal').style.display = 'none';
  
  // Recarregar lista de exercícios
  loadExercisesList();
  
  alert('Exercício atualizado com sucesso!');
}

// Adicionar atividade recente
function addActivity(action) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'Professor' };
  const activities = JSON.parse(localStorage.getItem('recentActivities')) || [];
  
  // Adicionar nova atividade
  activities.unshift({
    user: currentUser.name,
    action,
    date: new Date().toISOString()
  });
  
  // Manter apenas as 20 atividades mais recentes
  const updatedActivities = activities.slice(0, 20);
  
  // Salvar no localStorage
  localStorage.setItem('recentActivities', JSON.stringify(updatedActivities));
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

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Verificar se o usuário está logado como professor
  checkTeacherLogin();
  
  // Configurar tabs
  setupTabs();
  
  // Carregar dados iniciais
  loadDashboardData();
  loadExercisesList();
  loadStudentsList();
  
  // Configurar modal de novo exercício
  setupNewExerciseModal();
  
  // Configurar filtro de matéria
  document.getElementById('filter-subject').addEventListener('change', loadExercisesList);
  
  // Configurar logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentMode');
    window.location.href = 'index.html';
  });
});