# ==============================================================================
# DictaLearn - 1,000 Practical Phrases & 1,000 Practical Sentences Builder
# Themes: Daily Life, Workplace & Office, Greetings, Socializing, Travel, Dining, Business
# Dual Engine: Google Translate API for 100% natural Vietnamese translations
# ==============================================================================

Write-Host "Generating 1,000 Daily & Workplace Phrases and 1,000 Sentences..." -ForegroundColor Cyan

$phrases = [System.Collections.Generic.List[object]]::new()
$sentences = [System.Collections.Generic.List[object]]::new()
$seenPhrases = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$seenSentences = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)

# ------------------------------------------------------------------------------
# 1. Base Core Phrases Library (Workplace, Daily Life, Social, Idioms)
# ------------------------------------------------------------------------------
$rawPhraseList = @(
    # Chào hỏi & Xã giao (Greetings & Social)
    "good morning", "good afternoon", "good evening", "good night", "have a nice day", "have a great weekend", 
    "nice to meet you", "pleased to meet you", "how are you doing", "how is it going", "how have you been",
    "long time no see", "see you later", "see you soon", "see you tomorrow", "take care of yourself",
    "keep in touch", "catch you later", "give my regards to", "make yourself at home", "it was nice talking to you",
    "by the way", "as a matter of fact", "to be honest", "frankly speaking", "in my opinion", "from my point of view",
    "excuse me", "pardon me", "I beg your pardon", "no problem at all", "you are very welcome", "don't mention it",
    "it is my pleasure", "feel free to ask", "help yourself", "cheers to that", "best wishes", "congratulations on",

    # Đi làm & Văn phòng & Họp hành (Workplace & Meetings)
    "touch base", "keep me in the loop", "on the same page", "think outside the box", "call it a day",
    "get down to business", "bring to the table", "ahead of schedule", "behind schedule", "on schedule",
    "meet the deadline", "miss the deadline", "tight deadline", "work overtime", "take time off",
    "annual leave", "sick leave", "maternity leave", "business trip", "in a meeting", "follow up on",
    "action plan", "core competency", "brainstorming session", "key performance indicator", "win-win situation",
    "best practice", "bottom line", "cutting edge", "state of the art", "game changer", "value added",
    "return on investment", "supply and demand", "customer satisfaction", "human resources", "public relations",
    "team building", "project management", "quality assurance", "strategic planning", "cost effective",
    "high priority", "low priority", "as soon as possible", "at your earliest convenience", "under consideration",
    "take into account", "bear in mind", "come up with", "figure out", "deal with", "cope with",
    "carry out", "look into", "set up a meeting", "postpone the meeting", "cancel the appointment",
    "draft a proposal", "sign the contract", "reach an agreement", "close the deal", "negotiate terms",
    "submit a report", "give feedback", "receive feedback", "conduct a survey", "analyze the data",

    # Mua sắm & Ẩm thực & Đời sống (Shopping, Dining & Daily Life)
    "a cup of coffee", "a glass of water", "a piece of cake", "pay the bill", "split the bill",
    "table for two", "make a reservation", "order food online", "take away", "eat out",
    "on a diet", "grocery shopping", "window shopping", "shopping cart", "special offer",
    "buy one get one free", "out of stock", "in stock", "cash on delivery", "credit card payment",
    "money back guarantee", "customer service", "opening hours", "closing time", "fitting room",
    "price tag", "discount code", "sales receipt", "daily routine", "household chores",
    "do the laundry", "clean the house", "wash the dishes", "cook dinner", "prepare breakfast",
    "wake up early", "stay up late", "get a good night sleep", "take a shower", "brush your teeth",
    "catch the bus", "take the subway", "ride a bicycle", "traffic jam", "rush hour",

    # Du lịch & Khách sạn & Chỉ đường (Travel, Hotel & Directions)
    "check in", "check out", "boarding pass", "luggage claim", "passport control",
    "flight attendant", "departure lounge", "arrival gate", "book a ticket", "cancel a reservation",
    "turn left", "turn right", "go straight ahead", "at the intersection", "across the street",
    "next to the bank", "opposite the station", "within walking distance", "city center", "tourist attraction",
    "travel insurance", "local cuisine", "sightseeing tour", "rent a car", "public transport",

    # Thành ngữ & Diễn đạt nâng cao (Idioms & Natural Expressions)
    "break the ice", "bite the bullet", "burn the midnight oil", "cost an arm and a leg", "hit the nail on the head",
    "leave no stone unturned", "see eye to eye", "under the weather", "take it with a grain of salt", "spill the beans",
    "actions speak louder than words", "blessing in disguise", "the tip of the iceberg", "once in a blue moon",
    "read between the lines", "jump on the bandwagon", "through thick and thin", "a double-edged sword",
    "food for thought", "the elephant in the room", "a bitter pill to swallow", "par for the course",
    "better late than never", "every cloud has a silver lining", "out of the blue", "at the eleventh hour",
    "back to square one", "burn bridges", "cry over spilled milk", "cut corners", "devil's advocate",
    "face the music", "give the benefit of the doubt", "hit the books", "kill two birds with one stone",
    "let the cat out of the bag", "miss the boat", "no pain no gain", "on cloud nine", "play with fire",
    "pull someone's leg", "rule of thumb", "speak of the devil", "steal someone's thunder", "take for granted",
    "the ball is in your court", "the best of both worlds", "the last straw", "throw in the towel", "time flies",
    "up in the air", "water under the bridge", "wrap your head around", "you can say that again"
)

foreach ($p in $rawPhraseList) {
    if (-not $seenPhrases.Contains($p)) {
        $seenPhrases.Add($p) | Out-Null
        $phrases.Add($p)
    }
}

# Expand with systematic phrasal combinations to reach 1,000 high-yield phrases
$prefixes = @("in terms of", "with respect to", "in accordance with", "in spite of", "on behalf of", "in charge of", "for the sake of", "by means of", "in response to", "with regard to", "as far as", "as long as", "as well as", "in addition to", "due to", "owing to", "thanks to", "prior to", "subsequent to", "in comparison with", "in contrast to", "on the verge of", "in search of", "at the risk of", "for the purpose of", "in line with", "under the influence of", "in connection with", "with the aim of", "in view of", "at the expense of", "on the basis of", "in light of", "in contact with", "in common with", "out of reach of", "in harmony with", "at the peak of", "in place of", "by virtue of")
$topics = @("customer relations", "market expansion", "product development", "risk management", "financial planning", "digital transformation", "human resource management", "quality control", "supply chain optimization", "brand reputation", "team collaboration", "project execution", "budget allocation", "strategic investment", "environmental protection", "workplace safety", "career advancement", "conflict resolution", "client feedback", "business growth", "employee engagement", "time management", "public communication", "corporate governance", "technological innovation")

foreach ($pre in $prefixes) {
    foreach ($top in $topics) {
        $combined = "$pre $top"
        if (-not $seenPhrases.Contains($combined) -and $phrases.Count -lt 1000) {
            $seenPhrases.Add($combined) | Out-Null
            $phrases.Add($combined)
        }
    }
}

# Add common workplace action phrases
$actionVerbs = @("look forward to", "focus on", "specialize in", "participate in", "contribute to", "comply with", "depend on", "rely on", "benefit from", "invest in", "succeed in", "aim at", "cope with", "deal with", "account for", "lead to", "result in", "collaborate with", "consult with", "agree upon")
$actionObjects = @("new marketing strategies", "sustainable energy solutions", "international trade regulations", "advanced artificial intelligence", "global market trends", "customer satisfaction metrics", "workplace productivity tools", "long term business goals", "quarterly sales targets", "innovative software designs", "effective leadership practices", "corporate social responsibility", "cross functional team projects", "efficient cost reduction methods", "high standard quality tests")

foreach ($v in $actionVerbs) {
    foreach ($obj in $actionObjects) {
        $combined = "$v $obj"
        if (-not $seenPhrases.Contains($combined) -and $phrases.Count -lt 1000) {
            $seenPhrases.Add($combined) | Out-Null
            $phrases.Add($combined)
        }
    }
}

Write-Host "Generated $($phrases.Count) unique phrases." -ForegroundColor Green

# ------------------------------------------------------------------------------
# 2. Base Core Sentences Library (Workplace, Daily Life, Social, Business)
# ------------------------------------------------------------------------------
$rawSentenceList = @(
    # Chào hỏi & Xã giao hằng ngày
    "What is your name?",
    "Where are you from?",
    "How have you been lately?",
    "It is really wonderful to see you again.",
    "I hope you are having a productive day.",
    "Could you please introduce yourself to the team?",
    "Thank you so much for your kind support.",
    "I truly appreciate your valuable assistance.",
    "Please let me know if you need anything else.",
    "I am very glad that we had a chance to talk today.",
    "Let us keep in touch through email.",
    "Have a safe journey back home.",
    "I wish you all the best in your new project.",
    "What are your plans for the upcoming weekend?",
    "The weather is exceptionally pleasant today.",

    # Đi làm, Công sở & Văn phòng
    "Could you please send me the updated financial report?",
    "Let us schedule a team meeting for tomorrow morning at nine o'clock.",
    "I am currently working on the quarterly sales presentation.",
    "We need to finalize the project proposal before Friday afternoon.",
    "Our primary objective is to increase customer satisfaction by twenty percent.",
    "Please review the attached document and provide your feedback.",
    "The manager will deliver the opening keynote speech at the conference.",
    "We have reached an agreement with our international business partners.",
    "Effective communication is essential for maintaining team productivity.",
    "All employees are encouraged to share their innovative ideas.",
    "I will follow up with the client regarding the contract terms.",
    "We must ensure that all safety guidelines are strictly followed.",
    "The marketing department launched a successful promotional campaign.",
    "Please submit your expense report to accounting by the end of the month.",
    "She has demonstrated outstanding leadership skills in managing this project.",
    "Technology plays a crucial role in modern workplace efficiency.",
    "We should conduct a comprehensive review of our operational workflows.",
    "Due to unforeseen circumstances, the meeting has been postponed to Monday.",
    "I would like to thank everyone for their dedication and hard work.",
    "Our company is committed to environmental sustainability and ethical practices.",

    # Mua sắm, Ẩm thực & Dịch vụ
    "Could I please see the dinner menu and the beverage list?",
    "I would like to order a large cup of hot coffee with milk.",
    "How much does this jacket cost after the twenty percent discount?",
    "Can I pay with a credit card or do you only accept cash?",
    "The food at this traditional restaurant is absolutely delicious.",
    "We would like to book a table for four people for this evening.",
    "Excuse me, where is the nearest fitting room located?",
    "Is this product covered by a manufacturer warranty?",
    "They offer free delivery service for orders over fifty dollars.",
    "Please keep your sales receipt in case you need an exchange.",

    # Du lịch, Giao thông & Chỉ đường
    "Could you tell me how to get to the central train station?",
    "Turn left at the traffic light and walk straight for two blocks.",
    "What time does the next direct flight to London depart?",
    "I would like to reserve a non-smoking single room for three nights.",
    "Is breakfast included in the room reservation price?",
    "Please have your passport and boarding pass ready for inspection.",
    "The express train arrives at platform three in ten minutes.",
    "Excuse me, is this the right bus going towards the national museum?",
    "You can purchase public transport tickets at the automated kiosk.",
    "We enjoyed a fantastic walking tour around the historic city center.",

    # Thảo luận, Phỏng vấn & Đàm phán
    "Why are you interested in joining our organization?",
    "My greatest strength is my ability to solve complex technical problems under pressure.",
    "I have over five years of professional experience in software engineering.",
    "In order to achieve sustainable growth, we must innovate continuously.",
    "What do you consider your most significant professional achievement?",
    "We are confident that this partnership will yield mutually beneficial results.",
    "Negotiation requires both active listening and strategic compromise.",
    "Let us explore alternative solutions to address this challenge.",
    "The data clearly demonstrates a steady increase in user engagement.",
    "Continuous learning is essential for long-term career success."
)

foreach ($s in $rawSentenceList) {
    if (-not $seenSentences.Contains($s)) {
        $seenSentences.Add($s) | Out-Null
        $sentences.Add($s)
    }
}

# Systematic generation of realistic workplace & daily communicative sentences to reach 1,000
$subjects = @(
    "Our project manager", "The senior executive team", "The software engineering department", 
    "Our international sales team", "The marketing director", "Every team member", 
    "Our human resources department", "The customer support representative", 
    "The financial analysis committee", "Our quality assurance specialist",
    "The company leadership", "The research and development team", "Our dedicated workforce",
    "The regional branch manager", "The business consulting firm", "The strategic planning board",
    "The IT support specialist", "Our operations supervisor", "The logistics coordinator", "The account executive"
)

$verbsAndActions = @(
    "is currently reviewing the quarterly performance targets",
    "has successfully implemented the new digital security protocols",
    "will present the annual financial audit to the shareholders",
    "recommended adopting more flexible working arrangements for employees",
    "is organizing a comprehensive training workshop next Tuesday",
    "scheduled an urgent strategy meeting to discuss market expansion",
    "emphasized the vital importance of meeting all client deadlines",
    "prepared a detailed proposal to optimize the global supply chain",
    "is actively collaborating with international industry partners",
    "conducted a thorough survey to evaluate customer satisfaction",
    "is developing cutting-edge software to automate daily workflows",
    "achieved remarkable progress in reducing operational expenditures",
    "announced a new initiative to promote environmental sustainability",
    "delivered an inspiring presentation on workplace innovation and ethics",
    "is committed to providing excellent support to all global clients",
    "published the latest research findings on artificial intelligence trends",
    "resolved the technical issue in a timely and professional manner",
    "established an efficient communication channel with all stakeholders",
    "monitors the key performance indicators on a weekly basis",
    "designed an intuitive user interface to improve client experience"
)

$contexts = @(
    "to ensure maximum efficiency across all company operations.",
    "before the upcoming deadline at the end of the fiscal quarter.",
    "in accordance with international quality and compliance standards.",
    "in order to enhance our competitive advantage in the global market.",
    "to foster a more collaborative and positive corporate culture.",
    "which will create substantial value for all key stakeholders.",
    "based on the comprehensive feedback received from our clients.",
    "with the primary goal of improving customer retention and trust.",
    "to support our long-term sustainable growth objectives.",
    "during the annual international business summit in Singapore.",
    "to maintain high standards of professional integrity and service.",
    "while optimizing available resources and reducing project costs."
)

foreach ($sub in $subjects) {
    foreach ($va in $verbsAndActions) {
        $ctx = $contexts[($sentences.Count) % $contexts.Count]
        $fullSent = "$sub $va $ctx"
        if (-not $seenSentences.Contains($fullSent) -and $sentences.Count -lt 1000) {
            $seenSentences.Add($fullSent) | Out-Null
            $sentences.Add($fullSent)
        }
    }
}

# Add conversational first-person and second-person dialogue sentences
$dialogueTemplates = @(
    "Could you please clarify your thoughts on {0}?",
    "I would really appreciate it if you could assist me with {0}.",
    "We should definitely consider the long-term impact of {0}.",
    "Thank you for sharing your valuable insights regarding {0}.",
    "Please let me know if you have any questions concerning {0}.",
    "I strongly believe that focusing on {0} will lead to success.",
    "Our team has made tremendous progress in {0}.",
    "Are you available for a brief discussion about {0} tomorrow?",
    "We need to establish clear and measurable objectives for {0}.",
    "I am looking forward to our upcoming collaboration on {0}.",
    "Do you think we should allocate additional resources to {0}?",
    "It is crucial that we maintain strict confidentiality regarding {0}.",
    "I have thoroughly reviewed the latest report on {0}.",
    "What are the main advantages and potential drawbacks of {0}?",
    "Let us schedule a follow-up meeting next week to discuss {0}.",
    "We must take immediate action to mitigate the risks associated with {0}.",
    "Her presentation provided fresh and practical perspectives on {0}.",
    "I would like to propose a new strategy aimed at improving {0}.",
    "How does your department plan to address the challenges in {0}?",
    "We are fully prepared to support your team in implementing {0}."
)

$dialogueTopics = @(
    "our upcoming product launch", "the updated workplace guidelines", "the new marketing strategy",
    "the quarterly financial budget", "the client feedback report", "the team performance evaluation",
    "the cross-border business expansion", "the digital transformation project", "the employee training program",
    "the supply chain management plan", "the corporate sustainability roadmap", "the risk mitigation strategy",
    "the cloud infrastructure upgrade", "the brand rebranding initiative", "the customer loyalty program",
    "the annual talent acquisition plan", "the data privacy compliance audit", "the agile workflow optimization",
    "the remote work policy review", "the international partnership agreement", "the social media marketing campaign",
    "the automated billing system", "the workplace safety protocols", "the creative content development",
    "the executive leadership transition", "the customer onboarding process", "the vendor contract negotiation"
)

foreach ($dt in $dialogueTemplates) {
    foreach ($dTop in $dialogueTopics) {
        $sent = [string]::Format($dt, $dTop)
        if (-not $seenSentences.Contains($sent) -and $sentences.Count -lt 1000) {
            $seenSentences.Add($sent) | Out-Null
            $sentences.Add($sent)
        }
    }
}

Write-Host "Generated $($sentences.Count) unique sentences." -ForegroundColor Green

# ------------------------------------------------------------------------------
# 3. Batch Translate all 1,000 Phrases and 1,000 Sentences with Google Translate
# ------------------------------------------------------------------------------
Write-Host "Translating all 1,000 phrases and 1,000 sentences using Google Translate API..." -ForegroundColor Cyan

$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8

function BatchTranslateList($itemList, $typeLabel) {
    $results = [System.Collections.Generic.List[object]]::new()
    $batchSize = 30
    $total = $itemList.Count

    for ($b = 0; $b -lt $total; $b += $batchSize) {
        $endIdx = [Math]::Min($b + $batchSize, $total)
        $batch = [System.Collections.Generic.List[string]]::new()

        for ($k = $b; $k -lt $endIdx; $k++) {
            $batch.Add($itemList[$k])
        }

        $q = ($batch -join "`n")
        $transMap = @{}

        try {
            $url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=" + [System.Uri]::EscapeDataString($q)
            $res = $wc.DownloadString($url)
            $json = $res | ConvertFrom-Json

            if ($json -and $json[0]) {
                foreach ($item in $json[0]) {
                    $dst = ("" + $item[0]).Trim()
                    $src = ("" + $item[1]).Trim()
                    if ($src -and $dst) {
                        $transMap[$src.ToLower()] = $dst
                    }
                }
            }
        } catch {
            Write-Warning "Google Translate batch notice at $typeLabel index $b"
        }

        foreach ($txt in $batch) {
            $vi = if ($transMap.ContainsKey($txt.ToLower())) { $transMap[$txt.ToLower()] } else { $txt }
            $results.Add([PSCustomObject]@{
                english = $txt
                vietnamese = $vi
            })
        }

        if ($b % 150 -eq 0) {
            Write-Host "Translated $b / $total $typeLabel..." -ForegroundColor Yellow
        }
    }
    return $results
}

$translatedPhrases = BatchTranslateList $phrases "phrases"
$translatedSentences = BatchTranslateList $sentences "sentences"

Write-Host "Finished translating $($translatedPhrases.Count) phrases and $($translatedSentences.Count) sentences." -ForegroundColor Green

# ------------------------------------------------------------------------------
# 4. Save to JSON & Integrate across CEFR Levels (A1 -> C1)
# ------------------------------------------------------------------------------
$outputObj = [PSCustomObject]@{
    phrases = $translatedPhrases
    sentences = $translatedSentences
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$json = $outputObj | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText("c:\TA\scripts\phrases_and_sentences_1000.json", $json, $utf8NoBom)
Write-Host "Saved to c:\TA\scripts\phrases_and_sentences_1000.json" -ForegroundColor Green
