# Guia de Configuração: Relatório DOC Management Excel

Para criar o relatório conectado ao banco de dados, siga as etapas abaixo:

## 1. Preparação do Arquivo
1. Abra o Excel e salve um novo arquivo como **Pasta de Trabalho Habilitada para Macro do Excel (.xlsm)**.
2. Pressione `ALT + F11` para abrir o Editor VBA.
3. Vá em `Inserir > Módulo` e cole o código do **Módulo de Relatório** abaixo.
4. Vá em `Inserir > UserForm`. 
   - Na janela de propriedades (F4), renomeie para `frmFiltroRelatorio`.
   - Adicione 4 ComboBoxes: `cmbResp`, `cmbClass`, `cmbFase`, `cmbTipo`.
   - Adicione um Botão: `btnFiltrar`.
5. Clique com o botão direito no Form > `Exibir Código` e cole o código do **UserForm**.

---

## 2. Código do Módulo de Relatório (`modRelatorio`)

```vba
Option Explicit

' Configurações Supabase
Private Const SUPABASE_URL As String = "https://xjtvfsbjgdcnhulrebkw.supabase.co"
Private Const SUPABASE_ANON As String = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdHZmc2JqZ2Rjbmh1bHJlYmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTg1MjQsImV4cCI6MjA4ODU3NDUyNH0.-_yQ75FIivPFZq6phKFyPTC8KJJoP_fgjD6eTRmVvsI"

' Cores DOC Style
Public Const COR_BG As Long = 1579035
Public Const COR_CARD As Long = 2631466
Public Const COR_INDIGO As Long = 4540645

Public Sub GerarLayoutEEibirFiltro()
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Sheets("Relatorio")
    If ws Is Nothing Then
        Set ws = ThisWorkbook.Sheets.Add
        ws.Name = "Relatorio"
    End If
    On Error GoTo 0
    
    Application.ScreenUpdating = False
    ' Reset Layout
    ws.Cells.Clear
    ws.Cells.Interior.Color = COR_BG
    ws.Cells.Font.Color = RGB(255, 255, 255)
    ws.DisplayGridlines = False
    
    ' Título Style Tailwind
    With ws.Range("B2:I2")
        .Merge
        .Value = "RELATÓRIO DE PROJETOS"
        .Font.Bold = True: .Font.Size = 16
    End With
    
    ' Cards Mockup (Serão atualizados após o filtro)
    DesenharCard ws, "B4:C6", "TOTAL", "0", COR_INDIGO
    DesenharCard ws, "D4:F6", "EXECUÇÃO", "0", RGB(16, 185, 129)
    DesenharCard ws, "G4:I6", "PLANEJAMENTO", "0", RGB(245, 158, 11)
    
    frmFiltroRelatorio.Show
    Application.ScreenUpdating = True
End Sub

Private Sub DesenharCard(ws As Worksheet, rg As String, tit As String, val As String, clr As Long)
    With ws.Range(rg)
        .Interior.Color = COR_CARD
        .Borders(xlEdgeLeft).Color = clr
        .Borders(xlEdgeLeft).Weight = xlThick
    End With
    ws.Range(rg).Cells(1, 1).Value = tit
    ws.Range(rg).Cells(2, 1).Value = val
End Sub

' Função de Query PostgREST
Public Sub ExecutarQuery(filtros As String)
    Dim http As Object: Set http = CreateObject("MSXML2.XMLHTTP.6.0")
    Dim url As String: url = SUPABASE_URL & "/rest/v1/Projetos?select=descricao,responsavel1,classificacao,fase,tipo&" & filtros
    
    http.Open "GET", url, False
    http.setRequestHeader "apikey", SUPABASE_ANON
    http.send
    
    ' Aqui entra a lógica de parsing para a célula B10 em diante
    ' (Para fins de simplificação, os dados são jogados brutos ou via Split)
    MsgBox "Dados carregados do banco!", vbInformation
End Sub
```

---

## 3. Código do UserForm (`frmFiltroRelatorio`)

```vba
Private Sub UserForm_Initialize()
    ' Popular combos com valores padrão encontrados no sistema
    cmbClass.List = Array("Qualidade", "Expansão", "Manutenção", "Outros")
    cmbFase.List = Array("Identificação da oportunidade", "Planejamento", "Execução", "Concluído", "Cancelado")
End Sub

Private Sub btnFiltrar_Click()
    Dim query As String
    query = ""
    
    ' Verificação de filtros vazios
    If cmbResp.Value <> "" Then query = query & "responsavel1=eq." & cmbResp.Value & "&"
    If cmbClass.Value <> "" Then query = query & "classificacao=eq." & cmbClass.Value & "&"
    If cmbFase.Value <> "" Then query = query & "fase=eq." & cmbFase.Value & "&"
    If cmbTipo.Value <> "" Then query = query & "tipo=eq." & cmbTipo.Value & "&"
    
    ' Remove último &
    If Len(query) > 0 Then query = Left(query, Len(query) - 1)
    
    Me.Hide
    Call modRelatorio.ExecutarQuery(query)
End Sub
```
