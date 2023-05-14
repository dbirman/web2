using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class SelfiePanelBehavior : MonoBehaviour
{
    [SerializeField] private TMP_Text _text;
    [SerializeField] private Image _image;

    public static SelfiePanelBehavior Instance;

    private void Awake()
    {
        Instance = this;
    }

    public static void SetText(string text)
    {
        Instance._text.text = text;
    }

    public static void SetSprite(Sprite sprite)
    {
        Instance._image.sprite = sprite;
    }
}
