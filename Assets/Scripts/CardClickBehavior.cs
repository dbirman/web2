using UnityEngine;

public class CardClickBehavior : MonoBehaviour
{
    [SerializeField] private int _modalIdx;
    [SerializeField] private CameraRotatorBehavior camRotatorBehav;

    private void OnMouseOver()
    {
        // Play the mouse over animation for this card
    }

    private void OnMouseDown()
    {
        if (Input.GetMouseButtonDown(0))
        {
            ModalManager.ShowModal(_modalIdx);

            camRotatorBehav.SetControlBlock(true);
        }
    }

}
