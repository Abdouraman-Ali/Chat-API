import { body, param , validationResult , query} from "express-validator";
import multer from "multer";


//middleware pour verifier le body de la requete
const isBodyCreateContactCorrect = [
    body('name').trim().notEmpty().withMessage('the field "name" is required.').bail(),
    body('email').trim().notEmpty().withMessage('the field "email" is required.').bail(),
    body('email').trim().isEmail().withMessage('the "email" must be a valid one.').bail(),
    body('phone_number').trim().notEmpty().withMessage('the field "phone_number" is required.').bail(), // a verifier s'il est valide et sous format e164
]

const isBodyMessageCorrect = [
    body('content').trim().notEmpty().withMessage('the field "content" is required.'),
]


const isParamConversationIdCorrect = [
    param('conversationId')
      .isInt()
      .custom((value) => {
        if (!value || value.trim() === '') {
          throw new Error("Parameter: conversationId cannot be EMPTY or only WHITESPACE, and it must be an INTEGER");
        }
        return true;
    }),
]

const isParamMessageIdCorrect = [
    param('messageId')
      .isInt()
      .custom((value) => {
        if (!value || value.trim() === '') {
          throw new Error("Parameter: messageId cannot be EMPTY or only WHITESPACE, and it must be an INTEGER");
        }
        return true;
    }),
]

const isParamContactIdCorrect = [
    param('contactId')
      .custom((value) => {
        if (!value || value.trim() === '') {
          throw new Error("Parameter: contactId cannot be empty or only whitespace");
        }
        return true;
      }),
];


// configuration multer

const upload = multer({
  limits: {
    files: 3,                             // limite à 3 fichiers max par requête
    fileSize: 20 * 1024 * 1024             //  limite de taille par fichier : 20 Mo (20 * 1024 * 1024 octets)
  },
  fileFilter: (req, file, cb) => {
    
    // ➤ Callback personnalisé pour filtrer les fichiers selon leur mimetype, nom, etc.
    cb(null, true); // ici, on accepte tous les fichiers (tu peux ajouter une logique de filtrage)
  }
});


function multerErrorHandler(err, req, res, next) {
  
   if (err instanceof multer.MulterError) {
    
    // Personnalisation des messages
    let message = 'Error sending files.';

    if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'You can only send a maximum of 3 files.';
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size too large. Limit: 20 MB.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file. Check the field name or file count.';
    }

    return res.status(400).json({ error: message });
  }

  // Pour les autres erreurs non-Multer
  next(err);
  

}

// error handler middleware
const handleValidationErrors = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) 
    {
        console.log("Is There any Error : Yes");

        return res
        .status(400).json(
            {
                status: "FAILED",
                errors: errors.array(),
            }
        );
    }

    // console.log("Is There any Error : NO");

    next();
};
  

export default {
    isBodyMessageCorrect, 
    isBodyCreateContactCorrect,
    isParamContactIdCorrect,
    isParamConversationIdCorrect,
    isParamMessageIdCorrect,
    upload,
    multerErrorHandler,
    handleValidationErrors
}