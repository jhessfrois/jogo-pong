// Variáveis para as raquetes, bola e barras horizontais
let raqueteJogador, raqueteComputador, bola, barraSuperior, barraInferior
let fundoImg, bolaImg, barra1Img, barra2Img
let bounceSound, golSound
let placarJogador = 0
let placarComputador = 0

function preload() {
  fundoImg = loadImage("assets/img/fundo1.png")
  bolaImg = loadImage("assets/img/bola.png")
  barra1Img = loadImage("assets/img/barra01.png")
  barra2Img = loadImage("assets/img/barra02.png")
  bounceSound = loadSound("assets/sounds/bounce.wav")
  golSound = loadSound("assets/sounds/win.wav")
}

function setup() {
  createCanvas(800, 600)
  raqueteJogador = new Raquete(30, height / 2, 10, 60)
  raqueteComputador = new Raquete(width - 40, height / 2, 10, 60)
  bola = new Bola(10)
  barraSuperior = new Barra(0, 0, width, 5)
  barraInferior = new Barra(0, height, width, 5)
}

function draw() {
  let escala = Math.max(width / fundoImg.width, height / fundoImg.height)
  let imgWidth = fundoImg.width * escala
  let imgHeight = fundoImg.height * escala
  let imgX = (width - imgWidth) / 2
  let imgY = (height - imgHeight) / 2
  image(fundoImg, imgX, imgY, imgWidth, imgHeight)

  // Atualiza as posições das raquetes, bola e barras horizontais
  raqueteJogador.atualizar()
  raqueteComputador.atualizar()
  bola.atualizar(barraSuperior, barraInferior)

  // Verifica colisões entre bola e raquetes
  bola.verificarColisaoRaquete(raqueteJogador)
  bola.verificarColisaoRaquete(raqueteComputador)

  // Desenha as raquetes, a bola e as barras horizontais
  raqueteJogador.exibir()
  raqueteComputador.exibir()
  bola.exibir()
  barraSuperior.exibir()
  barraInferior.exibir()
}

class Raquete {
  constructor(x, y, w, h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  atualizar() {
    if (this === raqueteJogador) {
      this.y = mouseY
    } else {
      if (bola.y > this.y + this.h / 2) {
        this.y += 3
      } else if (bola.y < this.y - this.h / 2) {
        this.y -= 3
      }
    }
    this.y = constrain(
      this.y,
      this.h / 2 + barraSuperior.h,
      height - this.h / 2 - barraInferior.h
    )
  }

  exibir() {
    let img
    if (this === raqueteJogador) {
      img = barra1Img
    } else {
      img = barra2Img
    }
    push()
    imageMode(CENTER)
    translate(this.x, this.y)
    scale(0.3) // Escala as imagens para metade do tamanho
    image(img, 0, 0, img.width, img.height)
    pop()
  }
}

class Bola {
  constructor(r) {
    this.r = r
    this.reiniciar()
    this.anguloRotacao = 0
  }

  aumentarVelocidade() {
    const fatorAumento = 1.1
    this.velocidadeX *= fatorAumento
    this.velocidadeY *= fatorAumento
  }

  reiniciar() {
    this.x = width / 2
    this.y = height / 2
    this.velocidadeX = random([-4, -3, 3, 4])
    this.velocidadeY = random(-3, 3)
  }

  atualizar(barraSuperior, barraInferior) {
    this.x += this.velocidadeX
    this.y += this.velocidadeY
    this.anguloRotacao += Math.atan2(this.velocidadeY, this.velocidadeX) / 5

    if (
      this.y - this.r / 2 <= barraSuperior.y + barraSuperior.h ||
      this.y + this.r / 2 >= barraInferior.y - barraInferior.h
    ) {
      this.velocidadeY *= -1
    }

    if (this.x + this.r / 2 >= width) {
      placarComputador++
      this.reiniciar()
      tocarSomDeGol()
      narrarPlacar()
    } else if (this.x - this.r / 2 <= 0) {
      raqueteComputador.y = random(height - raqueteComputador.h)
      placarJogador++
      this.reiniciar()
      tocarSomDeGol()
      narrarPlacar()
    }
  }

  verificarColisaoRaquete(raquete) {
    if (
      this.x - this.r / 2 <= raquete.x + raquete.w / 2 &&
      this.x + this.r / 2 >= raquete.x - raquete.w / 2 &&
      this.y + this.r / 2 >= raquete.y - raquete.h / 2 &&
      this.y - this.r / 2 <= raquete.y + raquete.h / 2
    ) {
      // Inverte a direção horizontal da bola
      this.velocidadeX *= -1

      // Calcula a posição relativa da bola na raquete (entre -0.5 e 0.5)
      let posicaoRelativa = (this.y - raquete.y) / raquete.h

      // Define o ângulo da bola após a colisão
      let anguloBola = ((posicaoRelativa * PI) / 3) * 2.3

      // Atualiza a velocidade vertical da bola com base no ângulo
      this.velocidadeY = this.velocidadeX * Math.tan(anguloBola)

      // Aumenta a velocidade da bola
      this.aumentarVelocidade()

      tocarSomColisao()
    }
  }

  exibir() {
    push()
    imageMode(CENTER)
    translate(this.x, this.y)
    scale((2 * this.r) / 318)
    print(bolaImg.width, bolaImg.height)
    rotate(this.anguloRotacao)
    image(bolaImg, 0, 0, bolaImg.width, bolaImg.height)
    pop()
  }
}

function tocarSomColisao() {
  bounceSound.play()
}

function tocarSomDeGol() {
  golSound.play()
}

class Barra {
  constructor(x, y, w, h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  exibir() {
    fill(color("#000000"))
    rectMode(CENTER)
    rect(this.x + this.w / 2, this.y, this.w, this.h)
  }
}

function narrarPlacar() {
  const frase = `${placarJogador} a ${placarComputador}`
  const synth = window.speechSynthesis
  const utterance = new SpeechSynthesisUtterance(frase)
  utterance.lang = "pt-BR"
  synth.speak(utterance)
}

if (bola.x < 0) {
  // Gol do jogador
  placarJogador++
  narrarPlacar()
  bola = criarBola()
} else if (bola.x > width) {
  // Gol do computador
  placarComputador++
  narrarPlacar()
  bola = criarBola()
}
